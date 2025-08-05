pub fn generate_random_string(length: usize) -> String {
    use rand::Rng;
    rand::thread_rng()
        .sample_iter(&rand::distributions::Alphanumeric) // Genererar slumpmässiga alfanumeriska tecken
        .take(length) // Tar 8 tecken
        .map(char::from) // Konverterar till char
        .collect()
}