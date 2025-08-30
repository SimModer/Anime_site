# Anime_site

**Anime_site** არის ანიმე საიტის კონცეფციის frontend პროექტი.

---

## ვერსია 1 (V1)

**ფუნქციონალი:**  
- ანიმე საიტის პროტოტიპი, რომელიც საშუალებას იძლევა გახმოვანებული ანიმეების ყურება.  

**სტრუქტურა:**  
- **Anime Template:**  
  - შექმნილია HTML, CSS, JS-ის გამოყენებით.  
  - თითოეული ანიმე გვერდი იყენებს Template-ს, რომელიც სავსეა Database-დან მიღებული მონაცემებით.  
  - Python script ავსებს Template-ს Anilist API-ს საშუალებით და ქმნის ცალკეულ HTML გვერდს.  

- **Main Page:**  
  - მთავარი გვერდის კონცეფცია, შექმნილია HTML, CSS, JS-ის გამოყენებით.  
  - მთავარ გვერდზე ანიმეს განრიგი მუშაობს Anilist API-ს საშუალებით.  

- **Profile Template:**  
  - HTML, CSS, JS-ით შექმნილი პროფილის გვერდის კონცეფცია.

---

## ვერსია 2 (V2)

**ფუნქციონალი:**  
- განვითარებული ვერსია, მსგავსი MyAnimeList, AniList, Shikimori პლატფორმების.  
- მთავარი გვერდი აჩვენებს მიმდინარე ანიმეებს Anilist API-ს საშუალებით.  
- "მიმდინარე ანიმეები" ღილაკის საშუალებით შესაძლებელია მეტ ანიმეებს გვერდზე ნახვა (იგივე API-ს გამოყენებით).  

**სტრუქტურა:**  
- **Anime Template:** HTML, CSS, JS. თითოეული ანიმე გვერდი სავსეა Database-დან მიღებული ინფორმაციის მიხედვით.  
- **Main Page:** HTML, CSS, JS. აჩვენებს მიმდინარე ანიმეებს და საშუალებას იძლევა დამატებითი გვერდის ნახვა.  
- **Profile Template:** HTML, CSS, JS.  
- **Database (DB):**  
  - შეიცავს ანიმეების ინფორმაციას.  
  - CSV ფაილები ძირითადად აღებულია [Kaggle](https://www.kaggle.com/datasets)-დან.  
  - გამოყენებულია მოდიფიცირებული კოდი:  
    - [Anime parsing Shikimori](https://github.com/GRaf-NEET/Anime-parsing-Shikimori)  
    - [Anime Offline Database](https://github.com/manami-project/anime-offline-database) (anime-offline-database.json)
