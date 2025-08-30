# Anime_site

ანიმე საიტის კონცეფციის Frontend პროექტი.

---

## ვერსია 1 (V1)

**სტრუქტურა**  
- **Anime Template**  
  - HTML, CSS, JS.  
  - Template გვერდი, რომელიც იყენებს Database-დან მიღებული მონაცემებს.  
  - Python script ავსებს Template-ს Anilist API-ს საშუალებით და ქმნის ცალკეულ HTML გვერდს.  

- **Main Page**  
  - HTML, CSS, JS 
  - მთავარ გვერდზე ანიმეს განრიგი მუშაობს Anilist API-ს საშუალებით.  

- **Profile Template**  
  - HTML, CSS, JS
---

## ვერსია 2 (V2)

**ფუნქციონალი**  
- საიტის კონცეფციია მსგავსი MyAnimeList, AniList, Shikimori.

**სტრუქტურა**  
- **Anime Template**  
  - HTML, CSS, JS.  

- **Main Page**  
  - HTML, CSS, JS.
  - აჩვენებს მიმდინარე ანიმეებს Anilist API-ს საშუალებით.
  - "მიმდინარე ანიმეები" ღილაკის გამოყენებით შესაძლებელია მეტი ანიმეების შემდეგ გვერდზე ნახვა (იგივე API-ს საშუალებით).

- **Profile Template**  
  - HTML, CSS, JS.  

- **Database (DB)**  
  - შეიცავს ანიმეების ინფორმაციას.  
  - CSV ფაილები ძირითადად აღებულია [Kaggle](https://www.kaggle.com/datasets)-დან.  
  - გამოყენებულია მოდიფიცირებული კოდი:  
    - [Anime parsing Shikimori](https://github.com/GRaf-NEET/Anime-parsing-Shikimori)  
    - [Anime Offline Database](https://github.com/manami-project/anime-offline-database) (anime-offline-database.json)
