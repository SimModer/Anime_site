# Anime_site

**Anime_site** — საიტის კონცეფცია მსგავსი MyAnimeList, AniList, Shikimori-ის: საშუალებას გაძლევთ მოძებნოთ, დაათვალიეროთ და მართოთ ანიმეს კოლექციები.

---

## 🚀 ფუნქციონალი

- **Anime Template**  
  - აშენებულია HTML, CSS და JS-ზე.

- **მთავარი გვერდი**  
  - HTML, CSS, JS.
  - აჩვენებს მიმდინარე ანიმეებს [Anilist API](https://anilist.gitbook.io/api-graphql)-ს საშუალებით.
  - "მიმდინარე ანიმეები" ღილაკი საშუალებას გაძლევთ გადახვიდეთ შემდეგ გვერდზე მეტი ანიმეების სანახავად (იგივე API-ს გამოყენებით).

- **Profile Template**  
  - HTML, CSS, JS.

- **მონაცემთა ბაზა (DB)**  
  - შეიცავს ანიმეების ინფორმაციას.
  - CSV ფაილები აღებულია ძირითადად [Kaggle](https://www.kaggle.com/datasets)-დან.
  - გამოყენებულია მოდიფიცირებული კოდი:
    - [Anime parsing Shikimori](https://github.com/GRaf-NEET/Anime-parsing-Shikimori)
    - [Anime Offline Database](https://github.com/manami-project/anime-offline-database)

---

## 📁 პროექტის სტრუქტურა

- `main/` — მთავარი გვერდი (მიმდინარე ანიმეების ჩვენება)
- `anime-template/` — ანიმეს დეტალური გვერდის შაბლონი
- `profile-template/` — მომხმარებლის პროფილის შაბლონი
- `db/` — მონაცემთა ბაზის ფაილები  
- `assets/` — სტილები, სურათები და სკრიპტები

---

## ⚡️ გამოყენებული ტექნოლოგიები

- HTML, CSS, JavaScript
- Anilist API
- Kaggle datasets
- დამატებითი სკრიპტები სხვა ანიმე ბაზებიდან

---

> **P.S. ⚠️ პროექტის კოდი შეიცავს AI-ის მიერ გენერირებულ კოდს!**