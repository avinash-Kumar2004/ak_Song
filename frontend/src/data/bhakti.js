const BHAKTI = [
  {
    id: "artist_matarani",
    title: "Mata Rani Bhajans",        // ← name → title
    cover: "/bhaktis/mata.jpg",         // ← img → cover
    artist: "Devotional",               // ← genre → artist
    releaseDate: "2024",
    label: "Devotional",
    color: "#ff6b35",
    songs: [
      {
        id: "mata_01",
        title: "Aigiri Nandini",
        artists: "Mata Rani Bhajans",   // ← artists (plural) field
        duration: "5:12",
        url: "/songs/Mata/aigiri.mp3",  // ← file → url
      },
      {
        id: "mata_02",
        title: "Main Balak Tu Mata",
        artists: "Mata Rani Bhajans",
        duration: "4:36",
        url: "/songs/Mata/balak.mp3",
      },
      {
        id: "mata_03",
        title: "Pyara Saja Hai Tera Dwar Bhawani",
        artists: "Mata Rani Bhajans",
        duration: "6:05",
        url: "/songs/Mata/pyara.mp3",
      },
    ],
  },
  {
  id: "album_shiv",
  title: "Mahadeva Ji",
  cover: "/bhaktis/shiv.jpg",
  artist: "Devotional",
  releaseDate: "2024",
  label: "Devotional",
  color: "#ff6b35",
  songs: [
    {
      id: "shiv_01",
      title: "Namoh Namoh",
      artists: "Kailash Kher",
      duration: "5:29",
      plays: "145,884,221",
      file: "/songs/shiv/namo.mp3",
    },
    {
      id: "shiv_02",
      title: "Shiva Tandava Stotram",
      artists: "Traditional",
      duration: "4:12",
      plays: "178,332,554",
      file: "/songs/shiv/shiva.mp3",
    },
  ],
},
 {
    id: "vishnu",
    title: "Lord Vishnu",
    cover: "/bhaktis/vishu.jpg",
    artist: "Devotional",
    releaseDate: "2024",
    label: "Devotional",
    color: "#ff6b35",

    songs: [
      {
        id: "vishnu_01",
        title: "Om Namo Bhagavate Vasudevaya",
        artists: "Devotional",
        duration: "5:29",
        plays: "145,884,221",
        file: "/songs/vishnu/om.mp3",
      },
    ],
  },

  {
    id: "hanuman",
    title: "Hanuman Ji",
    cover: "/bhaktis/images.jpg",
    artist: "Devotional",
    releaseDate: "2024",
    label: "Devotional",
    color: "#ff6b35",

    songs: [
      {
        id: "hanuman_01",
        title: "Hanuman Chalisa",
        artists: "Devotional",
        duration: "9:29",
        plays: "145,884,221",
        file: "/songs/hanuman/chalisa.mp3",
      },
    ],
  },

  {
    id: "sai_baba",
    title: "Sai Baba",
    cover: "/bhaktis/sai.jpg",
    artist: "Devotional",
    releaseDate: "2024",
    label: "Devotional",
    color: "#ff6b35",

    songs: [
      {
        id: "sai_01",
        title: "Sainath Tere Hazaron Haath",
        artists: "Devotional",
        duration: "6:49",
        plays: "145,884,221",
        file: "/songs/sai/sai.mp3",
      },
    ],
  },

  {
    id: "ganesh",
    title: "Shree Ganesh",
    cover: "/bhaktis/gesnh.jpg",
    artist: "Devotional",
    releaseDate: "2024",
    label: "Devotional",
    color: "#ff6b35",

    songs: [
      {
        id: "ganesh_01",
        title: "Shankar Ji Ka Damroo Baje",
        artists: "Devotional",
        duration: "4:32",
        plays: "145,884,221",
        file: "/songs/ganesh/ganesh.mp3",
      },
    ],
  },

  {
    id: "krishna",
    title: "Shree Krishna",
    cover: "/bhaktis/krishna.jpg",
    artist: "Devotional",
    releaseDate: "2024",
    label: "Devotional",
    color: "#ff6b35",

    songs: [
      {
        id: "krishna_01",
        title: "Yada Yada Hi Dharmasya",
        artists: "Devotional",
        duration: "4:32",
        plays: "145,884,221",
        file: "/songs/krihsna/yada.mp3",
      },
    ],
  },
];
export default BHAKTI;