use anchor_lang::prelude::*;

declare_id!("25DPjpkgYRoDq1fjCktycLQDCWt4jHfKWXPVp6SaC2Gk");

pub const MAX_NAME_LEN: usize = 64;

#[program]
pub mod kirasub {
    use super::*;

    pub fn initialize_merchant(ctx: Context<InitializeMerchant>, name: String) -> Result<()> {
        require!(name.len() <= MAX_NAME_LEN, KiraSubError::NameTooLong);
        let m = &mut ctx.accounts.merchant_config;
        m.authority = ctx.accounts.authority.key();
        m.receiver = ctx.accounts.authority.key();
        m.name = name;
        m.plan_count = 0;
        m.bump = ctx.bumps.merchant_config;
        Ok(())
    }

    pub fn create_plan(
        ctx: Context<CreatePlan>,
        plan_id: u64,
        name: String,
        price_usd_cents: u64,
        period_days: u16,
    ) -> Result<()> {
        require!(name.len() <= MAX_NAME_LEN, KiraSubError::NameTooLong);
        require!(price_usd_cents > 0, KiraSubError::InvalidPrice);
        require!(period_days > 0, KiraSubError::InvalidPeriod);
        ctx.accounts.merchant_config.plan_count = ctx
            .accounts
            .merchant_config
            .plan_count
            .checked_add(1)
            .unwrap();
        let p = &mut ctx.accounts.plan;
        p.merchant = ctx.accounts.merchant_config.key();
        p.plan_id = plan_id;
        p.name = name;
        p.price_usd_cents = price_usd_cents;
        p.period_days = period_days;
        p.active = true;
        p.created_at = Clock::get()?.unix_timestamp;
        p.bump = ctx.bumps.plan;
        Ok(())
    }

    pub fn update_plan(
        ctx: Context<UpdatePlan>,
        name: Option<String>,
        price_usd_cents: Option<u64>,
        period_days: Option<u16>,
        active: Option<bool>,
    ) -> Result<()> {
        let p = &mut ctx.accounts.plan;
        if let Some(n) = name {
            require!(n.len() <= MAX_NAME_LEN, KiraSubError::NameTooLong);
            p.name = n;
        }
        if let Some(c) = price_usd_cents {
            require!(c > 0, KiraSubError::InvalidPrice);
            p.price_usd_cents = c;
        }
        if let Some(d) = period_days {
            require!(d > 0, KiraSubError::InvalidPeriod);
            p.period_days = d;
        }
        if let Some(a) = active {
            p.active = a;
        }
        Ok(())
    }

    pub fn grant_entitlement(
        ctx: Context<GrantEntitlement>,
        payment_reference_hash: [u8; 32],
        amount_usd_cents: u64,
    ) -> Result<()> {
        let plan = &ctx.accounts.plan;
        require!(plan.active, KiraSubError::PlanInactive);
        require!(
            plan.merchant == ctx.accounts.merchant_config.key(),
            KiraSubError::WrongMerchant
        );
        let clock = Clock::get()?;
        let starts_at = clock.unix_timestamp;
        let expires_at = starts_at + (plan.period_days as i64) * 86_400;
        let e = &mut ctx.accounts.entitlement;
        e.merchant = ctx.accounts.merchant_config.key();
        e.plan = ctx.accounts.plan.key();
        e.plan_id = plan.plan_id;
        e.subscriber = ctx.accounts.subscriber.key();
        e.active = true;
        e.starts_at = starts_at;
        e.expires_at = expires_at;
        e.payment_reference_hash = payment_reference_hash;
        e.last_payment_amount_usd_cents = amount_usd_cents;
        e.bump = ctx.bumps.entitlement;
        Ok(())
    }

    pub fn renew_entitlement(
        ctx: Context<RenewEntitlement>,
        payment_reference_hash: [u8; 32],
        amount_usd_cents: u64,
    ) -> Result<()> {
        let plan = &ctx.accounts.plan;
        require!(plan.active, KiraSubError::PlanInactive);
        let clock = Clock::get()?;
        let e = &mut ctx.accounts.entitlement;
        let base = std::cmp::max(clock.unix_timestamp, e.expires_at);
        e.expires_at = base + (plan.period_days as i64) * 86_400;
        e.active = true;
        e.payment_reference_hash = payment_reference_hash;
        e.last_payment_amount_usd_cents = amount_usd_cents;
        Ok(())
    }

    pub fn revoke_entitlement(ctx: Context<RevokeEntitlement>) -> Result<()> {
        let e = &mut ctx.accounts.entitlement;
        e.active = false;
        e.expires_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

// ─── State ────────────────────────────────────────────────────────────────

#[account]
pub struct MerchantConfig {
    pub authority: Pubkey,  // 32
    pub receiver: Pubkey,   // 32
    pub name: String,       // 4 + 64
    pub plan_count: u64,    // 8
    pub bump: u8,           // 1
}
impl MerchantConfig {
    pub const SPACE: usize = 8 + 32 + 32 + (4 + MAX_NAME_LEN) + 8 + 1 + 32;
}

#[account]
pub struct Plan {
    pub merchant: Pubkey,       // 32
    pub plan_id: u64,           // 8
    pub name: String,           // 4 + 64
    pub price_usd_cents: u64,   // 8
    pub period_days: u16,       // 2
    pub active: bool,           // 1
    pub created_at: i64,        // 8
    pub bump: u8,               // 1
}
impl Plan {
    pub const SPACE: usize = 8 + 32 + 8 + (4 + MAX_NAME_LEN) + 8 + 2 + 1 + 8 + 1 + 32;
}

#[account]
pub struct Entitlement {
    pub merchant: Pubkey,                   // 32
    pub plan: Pubkey,                       // 32
    pub plan_id: u64,                       // 8  (for PDA re-derivation)
    pub subscriber: Pubkey,                 // 32
    pub active: bool,                       // 1
    pub starts_at: i64,                     // 8
    pub expires_at: i64,                    // 8
    pub payment_reference_hash: [u8; 32],   // 32
    pub last_payment_amount_usd_cents: u64, // 8
    pub bump: u8,                           // 1
}
impl Entitlement {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 32 + 1 + 8 + 8 + 32 + 8 + 1 + 32;
}

// ─── Contexts ────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeMerchant<'info> {
    #[account(
        init,
        payer = authority,
        space = MerchantConfig::SPACE,
        seeds = [b"merchant", authority.key().as_ref()],
        bump,
    )]
    pub merchant_config: Account<'info, MerchantConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(plan_id: u64)]
pub struct CreatePlan<'info> {
    #[account(
        mut,
        seeds = [b"merchant", authority.key().as_ref()],
        bump = merchant_config.bump,
        has_one = authority @ KiraSubError::InvalidAuthority,
    )]
    pub merchant_config: Account<'info, MerchantConfig>,
    #[account(
        init,
        payer = authority,
        space = Plan::SPACE,
        seeds = [b"plan", merchant_config.key().as_ref(), &plan_id.to_le_bytes()],
        bump,
    )]
    pub plan: Account<'info, Plan>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePlan<'info> {
    #[account(
        seeds = [b"merchant", authority.key().as_ref()],
        bump = merchant_config.bump,
        has_one = authority @ KiraSubError::InvalidAuthority,
    )]
    pub merchant_config: Account<'info, MerchantConfig>,
    #[account(
        mut,
        seeds = [b"plan", merchant_config.key().as_ref(), &plan.plan_id.to_le_bytes()],
        bump = plan.bump,
        constraint = plan.merchant == merchant_config.key() @ KiraSubError::WrongMerchant,
    )]
    pub plan: Account<'info, Plan>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GrantEntitlement<'info> {
    #[account(
        seeds = [b"merchant", authority.key().as_ref()],
        bump = merchant_config.bump,
        has_one = authority @ KiraSubError::InvalidAuthority,
    )]
    pub merchant_config: Account<'info, MerchantConfig>,
    #[account(
        seeds = [b"plan", merchant_config.key().as_ref(), &plan.plan_id.to_le_bytes()],
        bump = plan.bump,
        constraint = plan.merchant == merchant_config.key() @ KiraSubError::WrongMerchant,
    )]
    pub plan: Account<'info, Plan>,
    #[account(
        init,
        payer = authority,
        space = Entitlement::SPACE,
        seeds = [
            b"entitlement",
            merchant_config.key().as_ref(),
            &plan.plan_id.to_le_bytes(),
            subscriber.key().as_ref(),
        ],
        bump,
    )]
    pub entitlement: Account<'info, Entitlement>,
    /// CHECK: subscriber wallet verified by PDA derivation
    pub subscriber: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RenewEntitlement<'info> {
    #[account(
        seeds = [b"merchant", authority.key().as_ref()],
        bump = merchant_config.bump,
        has_one = authority @ KiraSubError::InvalidAuthority,
    )]
    pub merchant_config: Account<'info, MerchantConfig>,
    #[account(
        seeds = [b"plan", merchant_config.key().as_ref(), &plan.plan_id.to_le_bytes()],
        bump = plan.bump,
        constraint = plan.merchant == merchant_config.key() @ KiraSubError::WrongMerchant,
    )]
    pub plan: Account<'info, Plan>,
    #[account(
        mut,
        seeds = [
            b"entitlement",
            merchant_config.key().as_ref(),
            &plan.plan_id.to_le_bytes(),
            entitlement.subscriber.as_ref(),
        ],
        bump = entitlement.bump,
        constraint = entitlement.merchant == merchant_config.key() @ KiraSubError::WrongMerchant,
    )]
    pub entitlement: Account<'info, Entitlement>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct RevokeEntitlement<'info> {
    #[account(
        seeds = [b"merchant", authority.key().as_ref()],
        bump = merchant_config.bump,
        has_one = authority @ KiraSubError::InvalidAuthority,
    )]
    pub merchant_config: Account<'info, MerchantConfig>,
    #[account(
        mut,
        seeds = [
            b"entitlement",
            merchant_config.key().as_ref(),
            &entitlement.plan_id.to_le_bytes(),
            entitlement.subscriber.as_ref(),
        ],
        bump = entitlement.bump,
        constraint = entitlement.merchant == merchant_config.key() @ KiraSubError::UnauthorizedRevocation,
    )]
    pub entitlement: Account<'info, Entitlement>,
    pub authority: Signer<'info>,
}

// ─── Errors ──────────────────────────────────────────────────────────────

#[error_code]
pub enum KiraSubError {
    #[msg("Invalid authority: caller is not the merchant")]
    InvalidAuthority,
    #[msg("Plan is inactive")]
    PlanInactive,
    #[msg("Entitlement belongs to wrong merchant or plan")]
    WrongMerchant,
    #[msg("Entitlement already active for this subscriber")]
    AlreadyActive,
    #[msg("Unauthorized: only merchant can revoke")]
    UnauthorizedRevocation,
    #[msg("Name exceeds 64 character limit")]
    NameTooLong,
    #[msg("Price must be greater than zero")]
    InvalidPrice,
    #[msg("Period must be greater than zero days")]
    InvalidPeriod,
}
