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
}
];
export default BHAKTI;