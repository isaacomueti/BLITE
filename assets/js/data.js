/* Blite Food — catalogue data.
 * Menu, prices (every size), descriptions, prep times and photos were imported from the live site
 * (blitefood.co.uk/food and /equipments) on 29 Sept 2026 by tools/crawl/gen_data.py.
 * In production this comes from Supabase (products, categories, equipment, events tables).
 * Allergens are NOT published on the live site — every dish needs a kitchen-confirmed allergen list
 * before launch (UK Food Information Regulations / Natasha's Law for prepacked-for-direct-sale).
 */
window.BliteData = (function () {
  const categories = [
    { id: "quick", name: "Quick Meals", title: "Quick Meals", blurb: "Ready the same day." },
    { id: "rice", name: "Rice", title: "Rice", blurb: "Jollof, fried, coconut and more." },
    { id: "soups", name: "Soups & Stews", title: "Soups & Stews", blurb: "Rich, flavourful, traditional." },
    { id: "peppersoup", name: "Peppersoup", title: "Peppersoup", blurb: "Light, spicy and warming." },
    { id: "porridge", name: "Porridge", title: "Porridge", blurb: "Beans, yam and ewa agonyi." },
    { id: "swallow", name: "Swallow", title: "Swallow", blurb: "Pounded yam, eba, amala." },
    { id: "meat", name: "Meat", title: "Meat & Poultry", blurb: "Goat, chicken, turkey, snails." },
    { id: "fish", name: "Fish", title: "Fish", blurb: "Tilapia, croaker, hake, red bream." },
    { id: "sides", name: "Side Dishes", title: "Side Dishes", blurb: "Perfect with every meal." },
    { id: "pastries", name: "Pastries & Snacks", title: "Pastries & Snacks", blurb: "Small chops, pies and puff puff." },
  ];

  // Featured on the homepage (signature section). Rice and soup bowls are real photos;
  // pastries and sides cut-outs are AI-generated stand-ins (see README).
  const featuredCategories = [
    { id: "soups", title: "Soups & Stews", blurb: "Rich, flavourful, traditional.", dish: "soup-egusi", img: "assets/img/categories/soup.webp" },
    { id: "rice", title: "Rice", blurb: "From jollof to fried rice.", dish: "rice", img: "assets/img/categories/rice.webp" },
    { id: "pastries", title: "Pastries & Snacks", blurb: "Quick bites, big satisfaction.", dish: "meat-pie", img: "assets/img/categories/pastries.webp" },
    { id: "sides", title: "Side Dishes", blurb: "Perfect with every meal.", dish: "plantain", img: "assets/img/categories/sides.webp" },
  ];

  // Each portion carries its own live price; `price` on the product is the lowest ("from").
  const products = [
  {
    "id": "jollof-rice-meal",
    "name": "Jollof Rice Meal",
    "cat": "quick",
    "price": 12.0,
    "desc": "A convenient combo of jollof rice, tender chicken, and sweet fried plantain, served with water and utensils — a complete Nigerian meal made easy for eating on the go.",
    "long": "A convenient combo of jollof rice, tender chicken, and sweet fried plantain, served with water and utensils — a complete Nigerian meal made easy for eating on the go.",
    "portions": [
      {
        "id": "1l",
        "name": "1 litre",
        "price": 12.0
      }
    ],
    "prep": "3 hours",
    "quick": true,
    "featured": false,
    "img": "assets/img/menu/jollof-rice-meal.webp"
  },
  {
    "id": "noodles-and-chicken",
    "name": "Noodles & Chicken",
    "cat": "quick",
    "price": 10.0,
    "desc": "Hot and flavourful noodles cooked with mixed vegetables, pepper, chicken, and egg, served with water and utensils for a satisfying meal on the go.",
    "long": "Hot and flavourful noodles cooked with mixed vegetables, pepper, chicken, and egg, served with water and utensils for a satisfying meal on the go.",
    "portions": [
      {
        "id": "combo",
        "name": "Combo",
        "price": 15.0
      },
      {
        "id": "1l",
        "name": "1 litre",
        "price": 10.0
      }
    ],
    "prep": "3 hours",
    "quick": true,
    "featured": false,
    "img": "assets/img/menu/noodles-and-chicken.webp"
  },
  {
    "id": "bulgur-wheat-rice",
    "name": "Bulgur Wheat Jollof Rice",
    "cat": "rice",
    "price": 20.0,
    "desc": "Fluffy bulgur wheat stir-fried with fresh vegetables and juicy prawns in rich Nigerian spices.",
    "long": "Fluffy bulgur wheat stir-fried with fresh vegetables and juicy prawns in rich Nigerian spices. Colourful, flavourful, and deeply satisfying — a healthy, modern twist on classic Nigerian fried rice.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 20.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 35.0
      },
      {
        "id": "6l",
        "name": "6 litres",
        "price": 48.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/bulgur-wheat-rice.webp"
  },
  {
    "id": "coconut-rice",
    "name": "Coconut Rice",
    "cat": "rice",
    "price": 19.0,
    "desc": "Tender, flavourful rice cooked in coconut milk for a rich, comforting, and mildly sweet side that pairs perfectly with any main.",
    "long": "Tender, flavourful rice cooked in coconut milk for a rich, comforting, and mildly sweet side that pairs perfectly with any main.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 19.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 35.0
      },
      {
        "id": "6l",
        "name": "6 litres",
        "price": 50.0
      },
      {
        "id": "12l",
        "name": "12 litres",
        "price": 90.0
      },
      {
        "id": "24l",
        "name": "24 litres",
        "price": 140.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/coconut-rice.webp"
  },
  {
    "id": "fried-rice",
    "name": "Fried Rice",
    "cat": "rice",
    "price": 20.0,
    "desc": "Savoury dish made with rice stir-fried with mixed vegetables, spices, and sometimes chicken, shrimp, or beef.",
    "long": "Savoury dish made with rice stir-fried with mixed vegetables, spices, and sometimes chicken, shrimp, or beef. It's a tasty and colorful!",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 20.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 30.0
      },
      {
        "id": "6l",
        "name": "6 litres",
        "price": 42.0
      },
      {
        "id": "12l",
        "name": "12 litres",
        "price": 70.0
      },
      {
        "id": "24l",
        "name": "24 litres",
        "price": 140.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/fried-rice.webp"
  },
  {
    "id": "jollof-rice",
    "name": "Jollof Rice",
    "cat": "rice",
    "price": 10.0,
    "desc": "Nigerian jollof: rice cooked in a rich tomato sauce, seasoned with spices, and often served with fried plantains, chicken, or fish.",
    "long": "Nigerian jollof: rice cooked in a rich tomato sauce, seasoned with spices, and often served with fried plantains, chicken, or fish. It's flavourful, vibrant, and perfect for any occasion.",
    "portions": [
      {
        "id": "1l",
        "name": "1 litre",
        "price": 10.0
      },
      {
        "id": "2l",
        "name": "2 litres",
        "price": 17.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 27.0
      },
      {
        "id": "6l",
        "name": "6 litres",
        "price": 37.0
      },
      {
        "id": "12l",
        "name": "12 litres",
        "price": 60.0
      },
      {
        "id": "24l",
        "name": "24 litres",
        "price": 120.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": true,
    "img": "assets/img/menu/jollof-rice.webp"
  },
  {
    "id": "assorted-egusi-soup",
    "name": "Assorted Egusi Soup",
    "cat": "soups",
    "price": 25.0,
    "desc": "A rich, hearty Nigerian melon seed soup cooked with tender beef, shaki (tripe), and cowfoot.",
    "long": "A rich, hearty Nigerian melon seed soup cooked with tender beef, shaki (tripe), and cowfoot. Blended with spinach and traditional seasonings for a nutty, flavour-packed taste that feels just like home.",
    "portions": [
      {
        "id": "1l",
        "name": "1 litre",
        "price": 25.0
      },
      {
        "id": "2l",
        "name": "2 litres",
        "price": 45.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 86.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": true,
    "img": "assets/img/menu/assorted-egusi-soup.webp"
  },
  {
    "id": "assorted-stew",
    "name": "Assorted Stew",
    "cat": "soups",
    "price": 33.0,
    "desc": "A hearty mix of tender beef, soft shaki (tripe), and juicy cowfoot cooked slowly in a rich, spicy tomato sauce.",
    "long": "A hearty mix of tender beef, soft shaki (tripe), and juicy cowfoot cooked slowly in a rich, spicy tomato sauce.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 33.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 60.0
      },
      {
        "id": "6l",
        "name": "6 litres",
        "price": 85.0
      },
      {
        "id": "12l",
        "name": "12 litres",
        "price": 130.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/assorted-stew.webp"
  },
  {
    "id": "ayamase",
    "name": "Ayamase",
    "cat": "soups",
    "price": 25.0,
    "desc": "Spicy green pepper sauce made with a blend of green chillies, onions, and traditional seasonings, cooked with assorted meats for a rich, smoky flavour.",
    "long": "Spicy green pepper sauce made with a blend of green chillies, onions, and traditional seasonings, cooked with assorted meats for a rich, smoky flavour. Best enjoyed with ofada rice.",
    "portions": [
      {
        "id": "1l",
        "name": "1 litre",
        "price": 25.0
      },
      {
        "id": "2l",
        "name": "2 litres",
        "price": 47.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": true,
    "img": "assets/img/menu/ayamase.webp"
  },
  {
    "id": "beef-and-chicken-stew",
    "name": "Beef & Chicken Stew",
    "cat": "soups",
    "price": 30.0,
    "desc": "A rich, flavourful blend of tender beef and juicy chicken simmered in a spicy tomato and pepper sauce.",
    "long": "A rich, flavourful blend of tender beef and juicy chicken simmered in a spicy tomato and pepper sauce. Hearty, comforting, and perfectly seasoned — a true Nigerian classic that brings the taste of home to your plate.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 30.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 57.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/beef-and-chicken-stew.webp"
  },
  {
    "id": "bitterleaf-soup",
    "name": "Bitterleaf Soup",
    "cat": "soups",
    "price": 55.0,
    "desc": "A classic Nigerian delicacy made with finely washed bitterleaf, cocoyam paste, and assorted meats including beef, shaki (tripe), and cowfoot.",
    "long": "A classic Nigerian delicacy made with finely washed bitterleaf, cocoyam paste, and assorted meats including beef, shaki (tripe), and cowfoot. Earthy, flavourful, and deeply satisfying — best enjoyed with poundo yam, eba, or semovita for a true taste of the east.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 55.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 110.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": true,
    "img": "assets/img/menu/bitterleaf-soup.webp"
  },
  {
    "id": "chicken-stew",
    "name": "Chicken Stew",
    "cat": "soups",
    "price": 28.0,
    "desc": "Rich and flavourful chicken stew made with tender chicken pieces simmered in a spicy tomato and pepper sauce, cooked to perfection for a true Nigerian taste.",
    "long": "Rich and flavourful chicken stew made with tender chicken pieces simmered in a spicy tomato and pepper sauce, cooked to perfection for a true Nigerian taste.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 28.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 50.0
      },
      {
        "id": "6l",
        "name": "6 litres",
        "price": 75.0
      },
      {
        "id": "12l",
        "name": "12 litres",
        "price": 150.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/chicken-stew.webp"
  },
  {
    "id": "edikaikon",
    "name": "Edikaikon",
    "cat": "soups",
    "price": 25.0,
    "desc": "Made with a rich blend of fluted pumpkin (ugu) and waterleaf, assorted meats, and seafood.",
    "long": "Made with a rich blend of fluted pumpkin (ugu) and waterleaf, assorted meats, and seafood. It’s flavourful, healthy, and best enjoyed with pounded yam or fufu.",
    "portions": [
      {
        "id": "1l",
        "name": "1 litre",
        "price": 25.0
      },
      {
        "id": "2l",
        "name": "2 litres",
        "price": 52.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 98.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/edikaikon.webp"
  },
  {
    "id": "eforiro",
    "name": "Eforiro",
    "cat": "soups",
    "price": 23.0,
    "desc": "Cooked in a rich pepper and tomato sauce with assorted meats, fish, and seasonings.",
    "long": "Cooked in a rich pepper and tomato sauce with assorted meats, fish, and seasonings. It’s bold, spicy, and perfect with amala, pounded yam, or rice.",
    "portions": [
      {
        "id": "1l",
        "name": "1 litre",
        "price": 23.0
      },
      {
        "id": "2l",
        "name": "2 litres",
        "price": 42.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 80.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/eforiro.webp"
  },
  {
    "id": "ewedu",
    "name": "Ewedu",
    "cat": "soups",
    "price": 10.0,
    "desc": "A silky soup made from jute leaves, lightly seasoned with traditional spices.",
    "long": "A silky soup made from jute leaves, lightly seasoned with traditional spices. Often paired with gbegiri and stew, it’s a staple Nigerian favourite known for its smooth texture and rich taste.",
    "portions": [
      {
        "id": "1l",
        "name": "1 litre",
        "price": 10.0
      },
      {
        "id": "2l",
        "name": "2 litres",
        "price": 20.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/ewedu.webp"
  },
  {
    "id": "gbegiri",
    "name": "Gbegiri",
    "cat": "soups",
    "price": 20.0,
    "desc": "Smooth, creamy bean soup made from peeled brown beans and blended spices, often served with ewedu and stew for a classic Nigerian delicacy full of comforting flavour.",
    "long": "Smooth, creamy bean soup made from peeled brown beans and blended spices, often served with ewedu and stew for a classic Nigerian delicacy full of comforting flavour.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 20.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 35.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/gbegiri.webp"
  },
  {
    "id": "ogbono",
    "name": "Ogbono Soup (Assorted)",
    "cat": "soups",
    "price": 25.0,
    "desc": "A rich, hearty Nigerian soup made from ground ogbono seeds and cooked with tender beef, shaki (tripe), and cowfoot.",
    "long": "A rich, hearty Nigerian soup made from ground ogbono seeds and cooked with tender beef, shaki (tripe), and cowfoot. Thick, flavourful, and deeply comforting — best enjoyed with poundo yam, eba, amala, or semovita for a truly satisfying meal.",
    "portions": [
      {
        "id": "1l",
        "name": "1 litre",
        "price": 25.0
      },
      {
        "id": "2l",
        "name": "2 litres",
        "price": 45.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 85.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/ogbono.webp"
  },
  {
    "id": "okra",
    "name": "Okra Soup (Assorted)",
    "cat": "soups",
    "price": 25.0,
    "desc": "Freshly chopped okra blended with a light, flavourful sauce and cooked with tender beef, shaki (tripe), and cowfoot.",
    "long": "Freshly chopped okra blended with a light, flavourful sauce and cooked with tender beef, shaki (tripe), and cowfoot. Deliciously thick and wholesome — best enjoyed with amala, eba, poundo yam, or semovita for that authentic Nigerian taste.",
    "portions": [
      {
        "id": "1l",
        "name": "1 litre",
        "price": 25.0
      },
      {
        "id": "2l",
        "name": "2 litres",
        "price": 40.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 80.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/okra.webp"
  },
  {
    "id": "seafood-okra",
    "name": "Seafood Okra",
    "cat": "soups",
    "price": 26.0,
    "desc": "Fresh okra cooked with a rich blend of prawns, fish, and other seafood in a mildly spiced sauce.",
    "long": "Fresh okra cooked with a rich blend of prawns, fish, and other seafood in a mildly spiced sauce. Savoury, nutritious, and packed with ocean flavour — a true Nigerian delicacy.",
    "portions": [
      {
        "id": "1l",
        "name": "1 litre",
        "price": 26.0
      },
      {
        "id": "2l",
        "name": "2 litres",
        "price": 51.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 98.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": true,
    "img": "assets/img/menu/seafood-okra.webp"
  },
  {
    "id": "assorted-peppersoup",
    "name": "Assorted Peppersoup",
    "cat": "peppersoup",
    "price": 30.0,
    "desc": "A hearty, spicy Nigerian broth made with tender cuts of beef, shaki (tripe), and cowfoot simmered in a blend of aromatic herbs and peppers.",
    "long": "A hearty, spicy Nigerian broth made with tender cuts of beef, shaki (tripe), and cowfoot simmered in a blend of aromatic herbs and peppers. Bold, warming, and full of authentic flavour — perfect on its own or served with white rice, yam, or plantain.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 30.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 60.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/assorted-peppersoup.webp"
  },
  {
    "id": "goat-meat-peppersoup",
    "name": "Goat Meat Peppersoup",
    "cat": "peppersoup",
    "price": 38.0,
    "desc": "A light, spicy Nigerian broth made with tender goat meat and infused with traditional herbs and peppers.",
    "long": "A light, spicy Nigerian broth made with tender goat meat and infused with traditional herbs and peppers. Comforting, flavourful, and perfect for any weather — best enjoyed on its own or with white rice, yam, or plantain.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 38.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 75.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": true,
    "img": "assets/img/menu/goat-meat-peppersoup.webp"
  },
  {
    "id": "tilapia-peppersoup",
    "name": "Tilapia Peppersoup",
    "cat": "peppersoup",
    "price": 38.0,
    "desc": "Fresh tilapia fish simmered in a light, spicy broth infused with traditional Nigerian herbs and peppers.",
    "long": "Fresh tilapia fish simmered in a light, spicy broth infused with traditional Nigerian herbs and peppers. Fragrant, soothing, and full of flavour — best enjoyed with white rice, yam, or plantain for a comforting, home-style meal.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 38.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 73.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/tilapia-peppersoup.webp"
  },
  {
    "id": "beans-porridge",
    "name": "Beans Porridge",
    "cat": "porridge",
    "price": 26.0,
    "desc": "Deliciously soft Nigerian beans simmered in a rich, spicy tomato and palm oil sauce.",
    "long": "Deliciously soft Nigerian beans simmered in a rich, spicy tomato and palm oil sauce. Nutritious, hearty, and full of flavour — a comforting meal that fuels your day the Nigerian way.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 26.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 48.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/beans-porridge.webp"
  },
  {
    "id": "ewa-agonyi",
    "name": "Ewa Agonyi",
    "cat": "porridge",
    "price": 33.0,
    "desc": "Soft, mashed beans served with a rich, smoky, pepper-infused sauce that bursts with bold Nigerian flavour.",
    "long": "Soft, mashed beans served with a rich, smoky, pepper-infused sauce that bursts with bold Nigerian flavour. Simple, spicy, and deeply satisfying — a true street-style classic brought to your table.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 33.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 63.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/ewa-agonyi.webp"
  },
  {
    "id": "yam-porridge-with-sauce",
    "name": "Yam Porridge with Sauce",
    "cat": "porridge",
    "price": 20.0,
    "desc": "Soft yam chunks cooked in a rich blend of tomatoes, peppers, onions, and palm oil, then topped with a savoury Nigerian-style sauce for extra flavour.",
    "long": "Soft yam chunks cooked in a rich blend of tomatoes, peppers, onions, and palm oil, then topped with a savoury Nigerian-style sauce for extra flavour. Creamy, comforting, and full of home-style goodness — a true taste of nigeria in every spoonful.",
    "portions": [
      {
        "id": "1l",
        "name": "1 litre",
        "price": 20.0
      },
      {
        "id": "2l",
        "name": "2 litres",
        "price": 32.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 61.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/yam-porridge-with-sauce.webp"
  },
  {
    "id": "amala",
    "name": "Amala",
    "cat": "swallow",
    "price": 17.0,
    "desc": "Traditional Nigerian swallow made from yam flour, cooked to a smooth, stretchy texture.",
    "long": "Traditional Nigerian swallow made from yam flour, cooked to a smooth, stretchy texture. Loved for its rich flavour!",
    "portions": [
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 17.0
      },
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 25.5
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 43.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/amala.webp"
  },
  {
    "id": "eba",
    "name": "Eba",
    "cat": "swallow",
    "price": 1.5,
    "desc": "Smooth and hearty staple made from dried grated cassava (garri), mixed with hot water and stirred to a firm texture.",
    "long": "Smooth and hearty staple made from dried grated cassava (garri), mixed with hot water and stirred to a firm texture.",
    "portions": [
      {
        "id": "1pcs",
        "name": "1 piece",
        "price": 1.5
      },
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 16.0
      },
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 23.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/eba.webp"
  },
  {
    "id": "pounded-yam",
    "name": "Pounded Yam",
    "cat": "swallow",
    "price": 15.0,
    "desc": "Smooth, stretchy, and fluffy swallow made from boiled yam, pounded to perfection.",
    "long": "Smooth, stretchy, and fluffy swallow made from boiled yam, pounded to perfection. A classic Nigerian favourite best enjoyed with soups like egusi, ogbono, or vegetable soup.",
    "portions": [
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 15.0
      },
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 23.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 38.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": true,
    "img": "assets/img/menu/pounded-yam.webp"
  },
  {
    "id": "hard-chicken",
    "name": "Hard Chicken",
    "cat": "meat",
    "price": 20.0,
    "desc": "Tender, well-seasoned hard chicken simmered in rich Nigerian spices and lightly fried for a bold, authentic flavour.",
    "long": "Tender, well-seasoned hard chicken simmered in rich Nigerian spices and lightly fried for a bold, authentic flavour. Juicy, aromatic, and perfect for those who love traditional Nigerian-style chicken.",
    "portions": [
      {
        "id": "3l",
        "name": "3 litres",
        "price": 20.0
      },
      {
        "id": "6l",
        "name": "6 litres",
        "price": 35.0
      },
      {
        "id": "12l",
        "name": "12 litres",
        "price": 65.0
      },
      {
        "id": "24l",
        "name": "24 litres",
        "price": 130.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/hard-chicken.webp"
  },
  {
    "id": "peppered-goat-meat",
    "name": "Peppered Goat Meat",
    "cat": "meat",
    "price": 60.0,
    "desc": "Succulent goat meat tossed in a rich, spicy pepper sauce for that authentic Nigerian kick.",
    "long": "Succulent goat meat tossed in a rich, spicy pepper sauce for that authentic Nigerian kick. Bold, tender, and irresistibly flavourful — the perfect blend of heat and satisfaction.",
    "portions": [
      {
        "id": "30pcs",
        "name": "30 pieces",
        "price": 60.0
      },
      {
        "id": "60pcs",
        "name": "60 pieces",
        "price": 120.0
      },
      {
        "id": "120pcs",
        "name": "120 pieces",
        "price": 240.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": true,
    "img": "assets/img/menu/peppered-goat-meat.webp"
  },
  {
    "id": "snails",
    "name": "Snails",
    "cat": "meat",
    "price": 10.0,
    "desc": "Delicately cooked extra large snails sautéed in a spicy, flavour-rich pepper sauce.",
    "long": "Delicately cooked extra large snails sautéed in a spicy, flavour-rich pepper sauce. Tender, exotic, and irresistibly tasty — a true Nigerian delicacy for special moments.",
    "portions": [
      {
        "id": "1pcs",
        "name": "1 piece",
        "price": 10.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/snails.webp"
  },
  {
    "id": "chicken",
    "name": "Soft Chicken",
    "cat": "meat",
    "price": 1.0,
    "desc": "Crispy, juicy, and seasoned to perfection.",
    "long": "Crispy, juicy, and seasoned to perfection. Deep-fried to  golden brown.",
    "portions": [
      {
        "id": "1pcs",
        "name": "1 piece",
        "price": 1.0
      },
      {
        "id": "6l",
        "name": "6 litres",
        "price": 30.0
      },
      {
        "id": "12l",
        "name": "12 litres",
        "price": 60.0
      },
      {
        "id": "24l",
        "name": "24 litres",
        "price": 120.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/chicken.webp"
  },
  {
    "id": "turkey",
    "name": "Turkey",
    "cat": "meat",
    "price": 30.0,
    "desc": "Tender turkey pieces marinated in a blend of authentic Nigerian herbs and spices, then fried to a crispy golden finish.",
    "long": "Tender turkey pieces marinated in a blend of authentic Nigerian herbs and spices, then fried to a crispy golden finish. Juicy, flavourful, and packed with bold taste — perfect as a side, snack, or the ideal complement to your favourite Nigerian meal",
    "portions": [
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 30.0
      },
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 45.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 75.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/turkey.webp"
  },
  {
    "id": "croaker-fish",
    "name": "Croaker Fish",
    "cat": "fish",
    "price": 40.0,
    "desc": "Tender croaker fish simmered in a hot, spicy pepper sauce that’s bold and full of Nigerian flavour.",
    "long": "Tender croaker fish simmered in a hot, spicy pepper sauce that’s bold and full of Nigerian flavour. Juicy, aromatic, and deeply satisfying — a delicious taste of home in every bite.",
    "portions": [
      {
        "id": "13pcs",
        "name": "13 pieces",
        "price": 40.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 75.0
      },
      {
        "id": "50pcs",
        "name": "50 pieces",
        "price": 150.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/croaker-fish.webp"
  },
  {
    "id": "hake-fish",
    "name": "Hake Fish",
    "cat": "fish",
    "price": 30.0,
    "desc": "Crispy, tender hake fish simmered in a rich, spicy pepper sauce bursting with Nigerian flavour.",
    "long": "Crispy, tender hake fish simmered in a rich, spicy pepper sauce bursting with Nigerian flavour. Light, savoury, and satisfying — perfect for spice lovers and seafood fans alike.",
    "portions": [
      {
        "id": "13pcs",
        "name": "13 pieces",
        "price": 30.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 60.0
      },
      {
        "id": "50pcs",
        "name": "50 pieces",
        "price": 120.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/hake-fish.webp"
  },
  {
    "id": "red-bream",
    "name": "Red Bream",
    "cat": "fish",
    "price": 30.0,
    "desc": "Fresh, succulent red bream marinated in authentic Nigerian spices and grilled or fried to perfection.",
    "long": "Fresh, succulent red bream marinated in authentic Nigerian spices and grilled or fried to perfection. Crispy on the outside, tender inside — a rich, satisfying taste of home.",
    "portions": [
      {
        "id": "13pcs",
        "name": "13 pieces",
        "price": 30.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 60.0
      },
      {
        "id": "50pcs",
        "name": "50 pieces",
        "price": 120.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/red-bream.webp"
  },
  {
    "id": "tilapia",
    "name": "Tilapia",
    "cat": "fish",
    "price": 30.0,
    "desc": "Fresh whole tilapia seasoned with rich Nigerian spices and grilled or fried to perfection.",
    "long": "Fresh whole tilapia seasoned with rich Nigerian spices and grilled or fried to perfection.",
    "portions": [
      {
        "id": "13pcs",
        "name": "13 pieces",
        "price": 30.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 60.0
      },
      {
        "id": "50pcs",
        "name": "50 pieces",
        "price": 120.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/tilapia.webp"
  },
  {
    "id": "dodo-gizzard",
    "name": "Dodo Gizzard",
    "cat": "sides",
    "price": 28.0,
    "desc": "Delicious combo of fried plantain and spicy gizzard, stir-fried in a rich pepper sauce.",
    "long": "Delicious combo of fried plantain and spicy gizzard, stir-fried in a rich pepper sauce. Sweet, savoury, and perfectly seasoned — a crowd favourite bursting with Nigerian flavour.",
    "portions": [
      {
        "id": "2l",
        "name": "2 litres",
        "price": 28.0
      },
      {
        "id": "4l",
        "name": "4 litres",
        "price": 54.0
      },
      {
        "id": "6l",
        "name": "6 litres",
        "price": 70.0
      },
      {
        "id": "12l",
        "name": "12 litres",
        "price": 135.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/dodo-gizzard.webp"
  },
  {
    "id": "moi-moi",
    "name": "Moi Moi",
    "cat": "sides",
    "price": 27.0,
    "desc": "Steamed bean pudding made from blended peeled beans, peppers, onions, and spices.",
    "long": "Steamed bean pudding made from blended peeled beans, peppers, onions, and spices. Soft, flavourful, and richly seasoned — a nutritious Nigerian favourite.",
    "portions": [
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 27.0
      },
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 40.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 65.0
      },
      {
        "id": "30pcs",
        "name": "30 pieces",
        "price": 78.0
      },
      {
        "id": "40pcs",
        "name": "40 pieces",
        "price": 104.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/moi-moi.webp"
  },
  {
    "id": "moi-moi-foil-small-size",
    "name": "Moi Moi (Small Foil)",
    "cat": "sides",
    "price": 17.0,
    "desc": "Steamed bean pudding made from blended peeled beans, peppers, onions, and spices, wrapped and cooked in foil for rich flavour and freshness.",
    "long": "Steamed bean pudding made from blended peeled beans, peppers, onions, and spices, wrapped and cooked in foil for rich flavour and freshness. Soft, tasty, and perfectly portioned in a small size.",
    "portions": [
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 17.0
      },
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 26.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 42.0
      },
      {
        "id": "50pcs",
        "name": "50 pieces",
        "price": 60.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/moi-moi-foil-small-size.webp"
  },
  {
    "id": "plantain",
    "name": "Plantain",
    "cat": "sides",
    "price": 33.0,
    "desc": "Sweet, ripe plantains sliced and fried to golden perfection.",
    "long": "Sweet, ripe plantains sliced and fried to golden perfection. Crispy on the outside, soft inside — the perfect side dish with rice, beans, or any Nigerian meal.",
    "portions": [
      {
        "id": "smalltray",
        "name": "Small tray",
        "price": 33.0
      },
      {
        "id": "mediumtray",
        "name": "Medium tray",
        "price": 58.0
      },
      {
        "id": "largetray",
        "name": "Large tray",
        "price": 106.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/plantain.webp"
  },
  {
    "id": "stewed-eggs",
    "name": "Stewed Eggs",
    "cat": "sides",
    "price": 10.0,
    "desc": "Delicious Nigerian-style stewed eggs cooked in a rich tomato and pepper sauce with fresh onions and traditional spices.",
    "long": "Delicious Nigerian-style stewed eggs cooked in a rich tomato and pepper sauce with fresh onions and traditional spices. A flavourful dish perfect with rice, yam, plantain, bread, or your favourite side.",
    "portions": [
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 10.0
      },
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 14.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/stewed-eggs.webp"
  },
  {
    "id": "akara",
    "name": "Akara",
    "cat": "pastries",
    "price": 6.0,
    "desc": "Golden and crispy on the outside, soft and fluffy inside — our akara is made from blended beans, onions, and mild spices, deep-fried to perfection.",
    "long": "Golden and crispy on the outside, soft and fluffy inside — our akara is made from blended beans, onions, and mild spices, deep-fried to perfection. A savoury Nigerian favourite, enjoyed best for breakfast or as a light snack, bringing warmth and tradition to every bite.",
    "portions": [
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 6.0
      },
      {
        "id": "30pcs",
        "name": "30 pieces",
        "price": 15.0
      },
      {
        "id": "60pcs",
        "name": "60 pieces",
        "price": 30.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/akara.webp"
  },
  {
    "id": "chicken-pie",
    "name": "Chicken Pie",
    "cat": "pastries",
    "price": 16.0,
    "desc": "Buttery, golden pastry filled with tender chicken, potatoes, and vegetables in a lightly seasoned creamy sauce.",
    "long": "Buttery, golden pastry filled with tender chicken, potatoes, and vegetables in a lightly seasoned creamy sauce. Warm, savoury, and perfectly baked for a delicious Nigerian treat.",
    "portions": [
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 16.0
      },
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 24.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 40.0
      },
      {
        "id": "50pcs",
        "name": "50 pieces",
        "price": 75.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/chicken-pie.webp"
  },
  {
    "id": "egg-roll",
    "name": "Egg Roll",
    "cat": "pastries",
    "price": 13.0,
    "desc": "Soft, golden pastry wrapped around a perfectly boiled egg, deep-fried to a crisp finish.",
    "long": "Soft, golden pastry wrapped around a perfectly boiled egg, deep-fried to a crisp finish. A classic Nigerian snack that’s simple, filling, and delicious.",
    "portions": [
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 13.0
      },
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 20.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 31.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/egg-roll.webp"
  },
  {
    "id": "fish-roll",
    "name": "Fish Roll",
    "cat": "pastries",
    "price": 16.0,
    "desc": "Crispy, golden pastry filled with spicy, seasoned fish flakes.",
    "long": "Crispy, golden pastry filled with spicy, seasoned fish flakes. A tasty Nigerian snack that’s flaky on the outside and richly flavoured within.",
    "portions": [
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 16.0
      },
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 24.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 40.0
      },
      {
        "id": "50pcs",
        "name": "50 pieces",
        "price": 80.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/fish-roll.webp"
  },
  {
    "id": "meat-pie",
    "name": "Meat Pie",
    "cat": "pastries",
    "price": 16.0,
    "desc": "Golden pastry filled with seasoned minced meat, potatoes, and vegetables.",
    "long": "Golden pastry filled with seasoned minced meat, potatoes, and vegetables. Savoury, hearty, and perfectly baked — a classic Nigerian snack that’s satisfying any time of day.",
    "portions": [
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 16.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 40.0
      },
      {
        "id": "50pcs",
        "name": "50 pieces",
        "price": 75.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/meat-pie.webp"
  },
  {
    "id": "nigerian-buns",
    "name": "Nigerian Buns",
    "cat": "pastries",
    "price": 5.0,
    "desc": "Golden, round, and perfectly soft inside with a slight crunch outside.",
    "long": "Golden, round, and perfectly soft inside with a slight crunch outside. Lightly sweet and delicious — a classic Nigerian snack that’s perfect any time of day.",
    "portions": [
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 5.0
      },
      {
        "id": "30pcs",
        "name": "30 pieces",
        "price": 13.0
      },
      {
        "id": "60pcs",
        "name": "60 pieces",
        "price": 25.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/nigerian-buns.webp"
  },
  {
    "id": "puff-puff",
    "name": "Puff Puff",
    "cat": "pastries",
    "price": 10.0,
    "desc": "Soft, fluffy, and golden brown — made from flour, sugar, yeast, and a touch of nutmeg, deep-fried to perfection.",
    "long": "Soft, fluffy, and golden brown — made from flour, sugar, yeast, and a touch of nutmeg, deep-fried to perfection. Lightly sweet and irresistibly soft, this beloved Nigerian street snack brings warmth and joy to every bite.",
    "portions": [
      {
        "id": "40pcs",
        "name": "40 pieces",
        "price": 10.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/puff-puff.webp"
  },
  {
    "id": "sausage-roll",
    "name": "Sausage Roll",
    "cat": "pastries",
    "price": 16.0,
    "desc": "Flaky, golden pastry filled with well-seasoned sausage meat.",
    "long": "Flaky, golden pastry filled with well-seasoned sausage meat. Savoury, tender, and baked to perfection — a favourite Nigerian snack for any time of day.",
    "portions": [
      {
        "id": "10pcs",
        "name": "10 pieces",
        "price": 16.0
      },
      {
        "id": "15pcs",
        "name": "15 pieces",
        "price": 24.0
      },
      {
        "id": "25pcs",
        "name": "25 pieces",
        "price": 39.0
      }
    ],
    "prep": "3 hours",
    "quick": false,
    "featured": false,
    "img": "assets/img/menu/sausage-roll.webp"
  }
].map((p) => Object.assign({ addons: [], allergens: null, dish: "rice" }, p, {
    portions: p.portions.map((o) => Object.assign({ delta: Math.round((o.price - p.price) * 100) / 100 }, o)),
    images: [p.img],
  }));

  const allergenNames = {
    celery: "Celery", gluten: "Cereals containing gluten", crustaceans: "Crustaceans", eggs: "Eggs", fish: "Fish", lupin: "Lupin",
    milk: "Milk", molluscs: "Molluscs", mustard: "Mustard", nuts: "Tree nuts", peanuts: "Peanuts", sesame: "Sesame", soya: "Soya", sulphites: "Sulphites",
  };

  // Live prices are per hire (the live site does not say per day). Stock levels are placeholders
  // so the date-availability check can be demonstrated — confirm real quantities with operations.
  const equipment = [
  {
    "id": "chafing-dishes",
    "name": "Chafing Dish",
    "price": 15.0,
    "per": "",
    "group": "Serving",
    "desc": "Stainless steel food warmers used to keep dishes hot and presentable during events or buffets. Ideal for serving meals at parties, weddings, and catering setups.",
    "img": "assets/img/hire/chafing-dishes.webp"
  },
  {
    "id": "silver-chafing-dish",
    "name": "Silver Chafing Dish",
    "price": 10.0,
    "per": "",
    "group": "Serving",
    "desc": "Elegant silver chafing dishes available for rent, perfect for keeping food warm and presentable at events, parties, and special occasions.",
    "img": "assets/img/hire/silver-chafing-dish.webp"
  },
  {
    "id": "charger-plates",
    "name": "Charger Plates",
    "price": 12.0,
    "per": "20 pieces",
    "group": "Tableware",
    "desc": "Stylish charger plates available for rent (20 pieces), designed to enhance table settings and add an elegant touch to events, parties, and special occasions.",
    "img": "assets/img/hire/charger-plates.webp"
  },
  {
    "id": "plates",
    "name": "Dinner Plates",
    "price": 6.0,
    "per": "20 pieces",
    "group": "Tableware",
    "desc": "Elegant, durable white plates available for rent (20 pieces minimum), perfect for serving both traditional Nigerian dishes and modern meals. Simple, clean, and stylish — ideal for events, parties, and special occasions.",
    "img": "assets/img/hire/plates.webp"
  },
  {
    "id": "forks",
    "name": "Forks",
    "price": 5.0,
    "per": "20 pieces",
    "group": "Cutlery",
    "desc": "High-quality stainless steel forks available for rent (20 pieces), durable and polished, perfect for dining at events, parties, and special occasions.",
    "img": "assets/img/hire/forks.webp"
  },
  {
    "id": "knives",
    "name": "Knives",
    "price": 5.0,
    "per": "20 pieces",
    "group": "Cutlery",
    "desc": "High-quality stainless steel knives available for rent (20 pieces), sharp, durable, and perfect for dining at events, parties, and special occasions.",
    "img": "assets/img/hire/knives.webp"
  },
  {
    "id": "spoons",
    "name": "Spoons",
    "price": 6.0,
    "per": "20 pieces",
    "group": "Cutlery",
    "desc": "High-quality stainless steel spoons available for rent (20 pieces) — durable, polished, and perfect for serving or dining at events, parties, and special occasions.",
    "img": "assets/img/hire/spoon.webp"
  },
  {
    "id": "wine-glasses",
    "name": "Wine Glasses",
    "price": 6.0,
    "per": "20 pieces",
    "group": "Glassware",
    "desc": "Elegant, clear wine glass cups available for rent (20 pieces), perfect for serving wine or beverages at events, parties, and special occasions.",
    "img": "assets/img/hire/wine-glasses.webp"
  },
  {
    "id": "big-drums-220l",
    "name": "Big Drum (220L)",
    "price": 15.0,
    "per": "",
    "group": "Storage",
    "desc": "Large 220L drum available for rent, sturdy and spacious, ideal for storing or transporting water, food ingredients, or supplies for events and large gatherings.",
    "img": "assets/img/hire/big-drums-220l.webp"
  },
  {
    "id": "small-drums-120l",
    "name": "Small Drum (120L)",
    "price": 10.0,
    "per": "",
    "group": "Storage",
    "desc": "Durable small drums available for rent, ideal for storing or transporting water, food items, or supplies during events and outdoor occasions.",
    "img": "assets/img/hire/small-drums-120l.webp"
  }
].map((e) => Object.assign({ unit: "hire", stock: 20, confirmStock: true, dish: "eq-plates" }, e));

  const events = [
    { id: "pauline-at-85", title: "Pauline at 85", type: "Birthdays", label: "Classic birthday party",
      img: "assets/img/events/pauline-85.webp", images: ["assets/img/events/pauline-85.webp", "assets/img/events/pauline-85-2.webp", "assets/img/events/pauline-85-3.webp"] },
  ];

  const deliveryZones = [
    // prefix → fee / ETA (placeholder zones centred on Hatfield, Herts — confirm with operations)
    { prefixes: ["AL"], fee: 2.5, eta: "30–45 minutes" },
    { prefixes: ["SG", "EN", "WD", "HP", "LU"], fee: 3.5, eta: "35–50 minutes" },
    { prefixes: ["N", "NW", "E", "EC", "WC", "W", "SW", "SE", "HA", "UB", "IG", "RM", "CM"], fee: 5.5, eta: "50–75 minutes" },
  ];

  const business = {
    name: "B-Lite Food",
    legalName: "B-LITE FOOD CATERING SERVICES LTD",
    address: "62 Featherdell, Hatfield, Hertfordshire",
    phone: "+44 7944 116960",
    phoneHref: "+447944116960",
    email: "support@blitefood.co.uk",
    infoEmail: "info@blitefood.co.uk",
    whatsapp: "https://wa.me/447944116960",
    instagram: "https://www.instagram.com/b_lite_food",
    tiktok: "https://www.tiktok.com/@blitefood",
    facebook: "https://facebook.com/",
    orderHours: { open: 7, close: 19 },
    deliveryHours: "8am–6pm, Monday to Saturday",
    prepTime: "3 hours",
  };

  return { categories, featuredCategories, products, equipment, events, allergenNames, deliveryZones, business };
})();
