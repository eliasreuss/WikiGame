// Country of origin (Wikidata P495) for each item, resolved November 2026.
// Coordinates are the origin's Wikidata location. Blurbs never name the place.

export type OriginPlace = { qid: string; name: string; lat: number; lon: number; iso2: string };

export type OriginItem = {
  qid: string;
  name: string;
  blurb: string;
  wikiTitle: string;
  places: OriginPlace[];
};

export const ORIGINS: OriginItem[] = [
  {
    "qid": "Q207832",
    "name": "Croissant",
    "blurb": "A buttery, crescent-shaped pastry.",
    "wikiTitle": "Croissant",
    "places": [
      {
        "qid": "Q142",
        "name": "France",
        "lat": 47,
        "lon": 2,
        "iso2": "fr"
      }
    ]
  },
  {
    "qid": "Q46383",
    "name": "Sushi",
    "blurb": "Vinegared rice, served with fish or vegetables.",
    "wikiTitle": "Sushi",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q191655",
    "name": "Taco",
    "blurb": "A folded tortilla holding a savoury filling.",
    "wikiTitle": "Taco",
    "places": [
      {
        "qid": "Q96",
        "name": "Mexico",
        "lat": 23,
        "lon": -102,
        "iso2": "mx"
      }
    ]
  },
  {
    "qid": "Q167893",
    "name": "Mayonnaise",
    "blurb": "A thick, creamy sauce of egg and oil.",
    "wikiTitle": "Mayonnaise",
    "places": [
      {
        "qid": "Q142",
        "name": "France",
        "lat": 47,
        "lon": 2,
        "iso2": "fr"
      }
    ]
  },
  {
    "qid": "Q182760",
    "name": "Feta",
    "blurb": "A salty, crumbly white cheese.",
    "wikiTitle": "Feta",
    "places": [
      {
        "qid": "Q41",
        "name": "Greece",
        "lat": 38.5,
        "lon": 23,
        "iso2": "gr"
      }
    ]
  },
  {
    "qid": "Q134862",
    "name": "Champagne",
    "blurb": "A sparkling wine, opened for a celebration.",
    "wikiTitle": "Champagne",
    "places": [
      {
        "qid": "Q142",
        "name": "France",
        "lat": 47,
        "lon": 2,
        "iso2": "fr"
      }
    ]
  },
  {
    "qid": "Q170219",
    "name": "Sake",
    "blurb": "A brewed rice drink, served warm or cold.",
    "wikiTitle": "Sake",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q212193",
    "name": "Nutella",
    "blurb": "A sweet brown spread for bread.",
    "wikiTitle": "Nutella",
    "places": [
      {
        "qid": "Q38",
        "name": "Italy",
        "lat": 42.5,
        "lon": 12.5,
        "iso2": "it"
      }
    ]
  },
  {
    "qid": "Q1331998",
    "name": "Marmite",
    "blurb": "A dark, salty spread people love or hate.",
    "wikiTitle": "Marmite",
    "places": [
      {
        "qid": "Q145",
        "name": "United Kingdom",
        "lat": 54.6,
        "lon": -2,
        "iso2": "gb"
      }
    ]
  },
  {
    "qid": "Q1051265",
    "name": "Instant noodles",
    "blurb": "Dried noodles, ready after a splash of hot water.",
    "wikiTitle": "Instant noodles",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q212121",
    "name": "Paella",
    "blurb": "Rice cooked with seafood or meat in a wide pan.",
    "wikiTitle": "Paella",
    "places": [
      {
        "qid": "Q29",
        "name": "Spain",
        "lat": 40.2,
        "lon": -3.5,
        "iso2": "es"
      }
    ]
  },
  {
    "qid": "Q715525",
    "name": "Spring roll",
    "blurb": "A thin wrapper rolled around a filling and fried.",
    "wikiTitle": "Spring roll",
    "places": [
      {
        "qid": "Q148",
        "name": "China",
        "lat": 35.8447,
        "lon": 103.4519,
        "iso2": "cn"
      }
    ]
  },
  {
    "qid": "Q177378",
    "name": "Tofu",
    "blurb": "A soft white block made from soybeans.",
    "wikiTitle": "Tofu",
    "places": [
      {
        "qid": "Q29520",
        "name": "China",
        "lat": 35,
        "lon": 105,
        "iso2": "cn"
      }
    ]
  },
  {
    "qid": "Q235169",
    "name": "Miso",
    "blurb": "A fermented soybean paste, the base of a soup.",
    "wikiTitle": "Miso",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q404973",
    "name": "Peking duck",
    "blurb": "Crisp-skinned roast duck, sliced at the table.",
    "wikiTitle": "Peking duck",
    "places": [
      {
        "qid": "Q148",
        "name": "China",
        "lat": 35.8447,
        "lon": 103.4519,
        "iso2": "cn"
      }
    ]
  },
  {
    "qid": "Q730298",
    "name": "Pad thai",
    "blurb": "Stir-fried rice noodles in a sweet and sour sauce.",
    "wikiTitle": "Pad thai",
    "places": [
      {
        "qid": "Q869",
        "name": "Thailand",
        "lat": 14,
        "lon": 101,
        "iso2": "th"
      }
    ]
  },
  {
    "qid": "Q1057953",
    "name": "Ceviche",
    "blurb": "Raw fish cured in citrus.",
    "wikiTitle": "Ceviche",
    "places": [
      {
        "qid": "Q419",
        "name": "Peru",
        "lat": -9.4,
        "lon": -76,
        "iso2": "pe"
      }
    ]
  },
  {
    "qid": "Q878189",
    "name": "Feijoada",
    "blurb": "A stew of beans and pork.",
    "wikiTitle": "Feijoada",
    "places": [
      {
        "qid": "Q45",
        "name": "Portugal",
        "lat": 38.7,
        "lon": -9.1833,
        "iso2": "pt"
      }
    ]
  },
  {
    "qid": "Q935807",
    "name": "Injera",
    "blurb": "A spongy flatbread that doubles as a plate.",
    "wikiTitle": "Injera",
    "places": [
      {
        "qid": "Q115",
        "name": "Ethiopia",
        "lat": 9,
        "lon": 40,
        "iso2": "et"
      }
    ]
  },
  {
    "qid": "Q2474644",
    "name": "Shakshuka",
    "blurb": "Eggs poached in a spiced tomato sauce.",
    "wikiTitle": "Shakshouka",
    "places": [
      {
        "qid": "Q79",
        "name": "Egypt",
        "lat": 27,
        "lon": 29,
        "iso2": "eg"
      }
    ]
  },
  {
    "qid": "Q727605",
    "name": "Churro",
    "blurb": "A ridged stick of fried dough, dusted with sugar.",
    "wikiTitle": "Churro",
    "places": [
      {
        "qid": "Q29",
        "name": "Spain",
        "lat": 40.2,
        "lon": -3.5,
        "iso2": "es"
      }
    ]
  },
  {
    "qid": "Q190531",
    "name": "Fondue",
    "blurb": "Melted cheese, eaten from a shared pot.",
    "wikiTitle": "Fondue",
    "places": [
      {
        "qid": "Q39",
        "name": "Switzerland",
        "lat": 46.7986,
        "lon": 8.232,
        "iso2": "ch"
      }
    ]
  },
  {
    "qid": "Q131582",
    "name": "Tiramisu",
    "blurb": "A layered dessert of coffee-soaked biscuits and cream.",
    "wikiTitle": "Tiramisu",
    "places": [
      {
        "qid": "Q38",
        "name": "Italy",
        "lat": 42.5,
        "lon": 12.5,
        "iso2": "it"
      }
    ]
  },
  {
    "qid": "Q12478",
    "name": "Macaron",
    "blurb": "A small, smooth cookie sandwiched with a filling.",
    "wikiTitle": "Macaron",
    "places": [
      {
        "qid": "Q142",
        "name": "France",
        "lat": 47,
        "lon": 2,
        "iso2": "fr"
      }
    ]
  },
  {
    "qid": "Q207968",
    "name": "Guacamole",
    "blurb": "Mashed avocado, eaten as a dip.",
    "wikiTitle": "Guacamole",
    "places": [
      {
        "qid": "Q96",
        "name": "Mexico",
        "lat": 23,
        "lon": -102,
        "iso2": "mx"
      }
    ]
  },
  {
    "qid": "Q2813",
    "name": "Coca-Cola",
    "blurb": "A sweet, fizzy brown drink.",
    "wikiTitle": "Coca-Cola",
    "places": [
      {
        "qid": "Q30",
        "name": "United States",
        "lat": 39.8282,
        "lon": -98.5795,
        "iso2": "us"
      }
    ]
  },
  {
    "qid": "Q13393",
    "name": "Onigiri",
    "blurb": "A rice ball, often with something hidden in the middle.",
    "wikiTitle": "Onigiri",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q466430",
    "name": "Nachos",
    "blurb": "Tortilla chips covered in melted cheese.",
    "wikiTitle": "Nachos",
    "places": [
      {
        "qid": "Q96",
        "name": "Mexico",
        "lat": 23,
        "lon": -102,
        "iso2": "mx"
      }
    ]
  },
  {
    "qid": "Q715858",
    "name": "Bubble tea",
    "blurb": "Iced tea with chewy pearls, drunk through a fat straw.",
    "wikiTitle": "Bubble tea",
    "places": [
      {
        "qid": "Q865",
        "name": "Taiwan",
        "lat": 24,
        "lon": 121,
        "iso2": "tw"
      }
    ]
  },
  {
    "qid": "Q822331",
    "name": "Matcha",
    "blurb": "Green tea, stone-ground to a powder and whisked.",
    "wikiTitle": "Matcha",
    "places": [
      {
        "qid": "Q29520",
        "name": "China",
        "lat": 35,
        "lon": 105,
        "iso2": "cn"
      }
    ]
  },
  {
    "qid": "Q234646",
    "name": "Ramen",
    "blurb": "Wheat noodles served in a hot broth.",
    "wikiTitle": "Ramen",
    "places": [
      {
        "qid": "Q148",
        "name": "China",
        "lat": 35.8447,
        "lon": 103.4519,
        "iso2": "cn"
      }
    ]
  },
  {
    "qid": "Q229385",
    "name": "Soy sauce",
    "blurb": "A dark, salty sauce for cooking.",
    "wikiTitle": "Soy sauce",
    "places": [
      {
        "qid": "Q29520",
        "name": "China",
        "lat": 35,
        "lon": 105,
        "iso2": "cn"
      }
    ]
  },
  {
    "qid": "Q160525",
    "name": "Pretzel",
    "blurb": "A knot-shaped bread with a salted crust.",
    "wikiTitle": "Pretzel",
    "places": [
      {
        "qid": "Q183",
        "name": "Germany",
        "lat": 51,
        "lon": 10,
        "iso2": "de"
      },
      {
        "qid": "Q46519",
        "name": "Southern Germany",
        "lat": 49,
        "lon": 10,
        "iso2": "de"
      }
    ]
  },
  {
    "qid": "Q28803",
    "name": "Sandwich",
    "blurb": "A filling between two slices of bread.",
    "wikiTitle": "Sandwich",
    "places": [
      {
        "qid": "Q21",
        "name": "England",
        "lat": 53,
        "lon": -1,
        "iso2": "gb-eng"
      }
    ]
  },
  {
    "qid": "Q177",
    "name": "Pizza",
    "blurb": "A round flatbread baked with toppings.",
    "wikiTitle": "Pizza",
    "places": [
      {
        "qid": "Q38",
        "name": "Italy",
        "lat": 42.5,
        "lon": 12.5,
        "iso2": "it"
      }
    ]
  },
  {
    "qid": "Q8486",
    "name": "Coffee",
    "blurb": "A brewed drink made from roasted beans.",
    "wikiTitle": "Coffee",
    "places": [
      {
        "qid": "Q115",
        "name": "Ethiopia",
        "lat": 9,
        "lon": 40,
        "iso2": "et"
      },
      {
        "qid": "Q805",
        "name": "Yemen",
        "lat": 15.5,
        "lon": 48,
        "iso2": "ye"
      }
    ]
  },
  {
    "qid": "Q6663",
    "name": "Hamburger",
    "blurb": "A cooked patty in a soft bun.",
    "wikiTitle": "Hamburger",
    "places": [
      {
        "qid": "Q30",
        "name": "United States",
        "lat": 39.8282,
        "lon": -98.5795,
        "iso2": "us"
      },
      {
        "qid": "Q183",
        "name": "Germany",
        "lat": 51,
        "lon": 10,
        "iso2": "de"
      }
    ]
  },
  {
    "qid": "Q5372",
    "name": "Basketball",
    "blurb": "Five a side, a bouncing ball, and a hoop.",
    "wikiTitle": "Basketball",
    "places": [
      {
        "qid": "Q30",
        "name": "United States",
        "lat": 39.8282,
        "lon": -98.5795,
        "iso2": "us"
      }
    ]
  },
  {
    "qid": "Q11035",
    "name": "Telephone",
    "blurb": "A device for talking to someone far away.",
    "wikiTitle": "Telephone",
    "places": [
      {
        "qid": "Q30",
        "name": "United States",
        "lat": 39.8282,
        "lon": -98.5795,
        "iso2": "us"
      }
    ]
  },
  {
    "qid": "Q12203",
    "name": "QR code",
    "blurb": "A square code a phone camera can read.",
    "wikiTitle": "QR code",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q9350",
    "name": "Yoga",
    "blurb": "Postures and breathing, practiced on a mat.",
    "wikiTitle": "Yoga",
    "places": [
      {
        "qid": "Q668",
        "name": "India",
        "lat": 22.8,
        "lon": 83,
        "iso2": "in"
      }
    ]
  },
  {
    "qid": "Q11420",
    "name": "Judo",
    "blurb": "A martial art of throws and holds.",
    "wikiTitle": "Judo",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q40561",
    "name": "Sumo",
    "blurb": "Two wrestlers, a ring, and a great deal of weight.",
    "wikiTitle": "Sumo",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q83357",
    "name": "Origami",
    "blurb": "Folding a sheet of paper into a shape.",
    "wikiTitle": "Origami",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q864",
    "name": "Pokémon",
    "blurb": "Creatures you collect, train, and battle.",
    "wikiTitle": "Pokémon",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q1035156",
    "name": "Hello Kitty",
    "blurb": "A white cat with a bow and no mouth.",
    "wikiTitle": "Hello Kitty",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q11934",
    "name": "Mickey Mouse",
    "blurb": "A cartoon mouse with round black ears.",
    "wikiTitle": "Mickey Mouse",
    "places": [
      {
        "qid": "Q30",
        "name": "United States",
        "lat": 39.8282,
        "lon": -98.5795,
        "iso2": "us"
      }
    ]
  },
  {
    "qid": "Q54078",
    "name": "IKEA",
    "blurb": "A shop where the furniture arrives in a flat box.",
    "wikiTitle": "IKEA",
    "places": [
      {
        "qid": "Q34",
        "name": "Sweden",
        "lat": 61,
        "lon": 15,
        "iso2": "se"
      }
    ]
  },
  {
    "qid": "Q49740",
    "name": "Minecraft",
    "blurb": "A game of digging, building, and surviving the night.",
    "wikiTitle": "Minecraft",
    "places": [
      {
        "qid": "Q34",
        "name": "Sweden",
        "lat": 61,
        "lon": 15,
        "iso2": "se"
      }
    ]
  },
  {
    "qid": "Q165094",
    "name": "Angry Birds",
    "blurb": "A game about launching birds at pigs.",
    "wikiTitle": "Angry Birds",
    "places": [
      {
        "qid": "Q33",
        "name": "Finland",
        "lat": 65,
        "lon": 27,
        "iso2": "fi"
      }
    ]
  },
  {
    "qid": "Q170484",
    "name": "Lego",
    "blurb": "Plastic bricks that click together.",
    "wikiTitle": "Lego",
    "places": [
      {
        "qid": "Q35",
        "name": "Denmark",
        "lat": 56,
        "lon": 10,
        "iso2": "dk"
      }
    ]
  },
  {
    "qid": "Q17243",
    "name": "Monopoly",
    "blurb": "A board game of streets, rent, and bankruptcy.",
    "wikiTitle": "Monopoly (game)",
    "places": [
      {
        "qid": "Q30",
        "name": "United States",
        "lat": 39.8282,
        "lon": -98.5795,
        "iso2": "us"
      }
    ]
  },
  {
    "qid": "Q1049294",
    "name": "Emoji",
    "blurb": "The small pictures sent in a message.",
    "wikiTitle": "Emoji",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q57036",
    "name": "Sauna",
    "blurb": "A wooden room of fierce dry heat.",
    "wikiTitle": "Sauna",
    "places": [
      {
        "qid": "Q33",
        "name": "Finland",
        "lat": 65,
        "lon": 27,
        "iso2": "fi"
      }
    ]
  },
  {
    "qid": "Q9794",
    "name": "Reggae",
    "blurb": "Slow, offbeat music with a heavy bass.",
    "wikiTitle": "Reggae",
    "places": [
      {
        "qid": "Q766",
        "name": "Jamaica",
        "lat": 18.18,
        "lon": -77.4,
        "iso2": "jm"
      }
    ]
  },
  {
    "qid": "Q689141",
    "name": "Spotify",
    "blurb": "An app that plays almost any song.",
    "wikiTitle": "Spotify",
    "places": [
      {
        "qid": "Q34",
        "name": "Sweden",
        "lat": 61,
        "lon": 15,
        "iso2": "se"
      }
    ]
  },
  {
    "qid": "Q5369",
    "name": "Baseball",
    "blurb": "A bat, a ball, and four bases.",
    "wikiTitle": "Baseball",
    "places": [
      {
        "qid": "Q30",
        "name": "United States",
        "lat": 39.8282,
        "lon": -98.5795,
        "iso2": "us"
      }
    ]
  },
  {
    "qid": "Q1734",
    "name": "Volleyball",
    "blurb": "Two teams, a net, and a ball that stays off the ground.",
    "wikiTitle": "Volleyball",
    "places": [
      {
        "qid": "Q30",
        "name": "United States",
        "lat": 39.8282,
        "lon": -98.5795,
        "iso2": "us"
      }
    ]
  },
  {
    "qid": "Q847",
    "name": "Tennis",
    "blurb": "Rackets, a net, and a ball on a marked court.",
    "wikiTitle": "Tennis",
    "places": [
      {
        "qid": "Q21",
        "name": "England",
        "lat": 53,
        "lon": -1,
        "iso2": "gb-eng"
      }
    ]
  },
  {
    "qid": "Q5375",
    "name": "Cricket",
    "blurb": "A bat-and-ball game played over long matches.",
    "wikiTitle": "Cricket",
    "places": [
      {
        "qid": "Q21",
        "name": "England",
        "lat": 53,
        "lon": -1,
        "iso2": "gb-eng"
      }
    ]
  },
  {
    "qid": "Q3930",
    "name": "Table tennis",
    "blurb": "Paddles, a small ball, and a table divided by a net.",
    "wikiTitle": "Table tennis",
    "places": [
      {
        "qid": "Q21",
        "name": "England",
        "lat": 53,
        "lon": -1,
        "iso2": "gb-eng"
      }
    ]
  },
  {
    "qid": "Q5377",
    "name": "Golf",
    "blurb": "Hitting a small ball into a distant hole.",
    "wikiTitle": "Golf",
    "places": [
      {
        "qid": "Q22",
        "name": "Scotland",
        "lat": 57,
        "lon": -5,
        "iso2": "gb-sct"
      }
    ]
  },
  {
    "qid": "Q11403",
    "name": "Samba",
    "blurb": "A fast dance, driven by the hips, and the music for it.",
    "wikiTitle": "Samba",
    "places": [
      {
        "qid": "Q155",
        "name": "Brazil",
        "lat": -14,
        "lon": -53,
        "iso2": "br"
      }
    ]
  },
  {
    "qid": "Q11168",
    "name": "Super Mario Bros.",
    "blurb": "A plumber running and jumping through a scrolling world.",
    "wikiTitle": "Super Mario Bros.",
    "places": [
      {
        "qid": "Q17",
        "name": "Japan",
        "lat": 35,
        "lon": 136,
        "iso2": "jp"
      }
    ]
  },
  {
    "qid": "Q718",
    "name": "Chess",
    "blurb": "Two armies on a checkered board, and a king to trap.",
    "wikiTitle": "Chess",
    "places": [
      {
        "qid": "Q11774",
        "name": "Gupta Empire",
        "lat": 23.99,
        "lon": 88.73,
        "iso2": ""
      }
    ]
  },
  {
    "qid": "Q11419",
    "name": "Karate",
    "blurb": "Punches, kicks, and blocks, practiced in a white suit.",
    "wikiTitle": "Karate",
    "places": [
      {
        "qid": "Q28025",
        "name": "Ryukyu Kingdom",
        "lat": 26.2,
        "lon": 127.68,
        "iso2": ""
      }
    ]
  },
  {
    "qid": "Q187495",
    "name": "Baklava",
    "blurb": "Flaky pastry layered with nuts and syrup.",
    "wikiTitle": "Baklava",
    "places": [
      {
        "qid": "Q12560",
        "name": "Ottoman Empire",
        "lat": 41,
        "lon": 29,
        "iso2": ""
      }
    ]
  },
  {
    "qid": "Q4551",
    "name": "Borscht",
    "blurb": "A sour soup, red with beetroot.",
    "wikiTitle": "Borscht",
    "places": [
      {
        "qid": "Q1108445",
        "name": "Kievan Rus'",
        "lat": 50.45,
        "lon": 30.53,
        "iso2": ""
      }
    ]
  },
  {
    "qid": "Q195",
    "name": "Chocolate",
    "blurb": "A sweet made from roasted cacao seeds.",
    "wikiTitle": "Chocolate",
    "places": [
      {
        "qid": "Q13703",
        "name": "Mesoamerica",
        "lat": 16,
        "lon": -93,
        "iso2": ""
      }
    ]
  },
  {
    "qid": "Q615392",
    "name": "Bánh mì",
    "blurb": "A crusty roll piled with meat, herbs, and pickles.",
    "wikiTitle": "Bánh mì",
    "places": [
      {
        "qid": "Q180573",
        "name": "South Vietnam",
        "lat": 10.78,
        "lon": 106.7,
        "iso2": ""
      }
    ]
  }
];
