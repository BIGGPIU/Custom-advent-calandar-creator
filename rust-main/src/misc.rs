use rand::{self, seq::SliceRandom};


pub struct Fun {

}


impl Fun {
    pub fn random_songs_i_want_to_gas() -> String {

        // I doubt anyone will see this but if someone makes a PR that adds a song to this then
        // I'll merge it 
        let mut songs = vec![
            "She's Homeless by CreepP",
            "stfu by CreepP",
            "Braindead by CreepP",
            "Laur Love by Joe Fight & Laur",
            "Oshi-Katsu Angel Miss Vivian by FARUCO, DJ Myosuke, Mustard and beatMARIO",
            "Depressed Mind by Xystran",
            "Mirage Of Lake by RYUWAVE",
            "Here We Go Again by Coakira",
            "XMASCORE by noisetripper",
            "Harshcore Dream by DJ Myosuke",
            "Joe Fight by DJ Myosuke",
            "You Killed My XXXXXX by DJ Myosuke",
            "ENGINECORE by DJK Myosuke",
            "Speedcore Angel by SCENAR10",
            "yes, I know by TohlPeaks",
            "Aegleseeker by Silentroom vs Frums"
        ];

        {
            let mut rng = rand::rng();
    
            songs.shuffle(&mut rng);

        }



        return format!("listen to {}", songs[0].to_string()).to_string();
    }
}