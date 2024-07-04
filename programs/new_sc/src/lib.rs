use anchor_lang::prelude::*;
use switchboard_on_demand::accounts::RandomnessAccountData;

declare_id!("7uXeBdeeaCmjsLEhdpvQ3Q2SHAjKTi2YR42x4Hhy8B9N");

#[program]
pub mod switchboard_random_no {
    use super::*;

    // Settle the flip after randomness is revealed
    pub fn get_random_no(ctx: Context<GenrateRand>,) -> Result<()> {

        let clock: Clock = Clock::get()?;
        // call the switchboard on-demand parse function to get the randomness data
        let randomness_data = RandomnessAccountData::parse(ctx.accounts.randomness_account_data.data.borrow()).unwrap();
        // call the switchboard on-demand get_value function to get the revealed random value
        let random_value = randomness_data.get_value(&clock)
            .map_err(|_| ErrorCode::RandomnessNotResolved)?;

        // Combine multiple bytes into a larger number
        let combined_value = (u32::from(random_value[0]) << 24)
            | (u32::from(random_value[1]) << 16)
            | (u32::from(random_value[2]) << 8)
            | u32::from(random_value[3]);

        // Normalize the combined value to a range of 100 to 999
        let random_three_digit_number = (combined_value % 900) + 100;

        // The value is now a random three-digit number
        msg!("Random three-digit number: {}", random_three_digit_number);
        msg!("seed slot: {}", randomness_data.seed_slot);
        msg!("reveal slot: {}", randomness_data.reveal_slot);

        Ok(())
    }


}



#[derive(Accounts)]
pub struct GenrateRand<'info> {
    /// CHECK: The account's data is validated manually within the handler.
    pub randomness_account_data: AccountInfo<'info>,
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// === Errors ===
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access attempt.")]
    Unauthorized,
    GameStillActive,
    NotEnoughFundsToPlay,
    RandomnessAlreadyRevealed,
    RandomnessNotResolved,
}

