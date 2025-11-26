



pub struct Constants {
    pub sqlite_path:String
}



impl Default for Constants {
    fn default() -> Self {
        // panic!("please look over reviewme.rs");
        Self { sqlite_path: "sqlite:C:\\Users\\diyaj\\Downloads\\Recommend me stuff\\New folder\\Custom-advent-calandar-creator\\db.sqlite".to_string() }
    }
}