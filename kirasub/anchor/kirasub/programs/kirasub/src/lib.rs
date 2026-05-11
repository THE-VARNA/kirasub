use anchor_lang::prelude::*;

declare_id!("25DPjpkgYRoDq1fjCktycLQDCWt4jHfKWXPVp6SaC2Gk");

#[program]
pub mod kirasub {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
