// ─────────────────────────────────────────────────────────────────────────────
//  ALBUMS DATA — Yahan tu apne hisaab se albums add karta ja
//  cover: public/covers/ folder mein image rakh, ya null chhod auto-gradient ke liye
//  songs[].file: public/songs/ folder mein MP3 rakh, ya null chhod demo ke liye
// ─────────────────────────────────────────────────────────────────────────────

const ALBUMS = [
 {
  id: "album_dhurandhar",
  title: "Dhurandhar The Revenge",
  artist: "Shashwat Sachdev",
  cover: "/covers/dhurandhar.jpg",
  color: "#8B1a1a",
  releaseDate: "17 March 2026",
  label: "T-Series",
  songs: [
    {
      id: "dhu_01",
      title: "Aari Aari",
      artists: "Jasmine Sandlas, Satinder Sartaaj",
      duration: "3:18",
      plays: "12,143,892",
      file: "/songs/Dhurandhar/AariAari.mp3",
    },
    {
      id: "dhu_02",
      title: "Lutt Le Gaya",
      artists: "Jasmine Sandlas",
      duration: "2:54",
      plays: "8,921,455",
      file: "/songs/Dhurandhar/LuttLeGayaDhurandhar.mp3",
    },
    {
      id: "dhu_03",
      title: "Jaan Se Guzarte Hain",
      artists: "Satinder Sartaaj",
      duration: "3:42",
      plays: "6,778,210",
      file: "/songs/Dhurandhar/janSeGujartehai.mp3",
    },
    {
      id: "dhu_04",
      title: "Shararat",
      artists: "Jasmine Sandlas, Ranveer Singh",
      duration: "2:59",
      plays: "10,502,667",
      file: "/songs/Dhurandhar/ShararatDhurandhar.mp3",
    },
  ],
},

 {
  id: "album_bairan",
  title: "Bairan",
  artist: "Banjaare",
  cover: "/covers/Bairan.jpg",
  color: "#1a1a3e",
  releaseDate: "10 March 2026",
  label: "Sony Music",
  songs: [
    {
      id: "bai_01",
      title: "Bairan",
      artists: "Banjaare",
      duration: "4:08",
      plays: "5,421,783",
      file: "/songs/Bairan/bairan.mp3",
    },
    {
      id: "bai_02",
      title: "Haye-Re-Biye",
      artists: "Banjaare",
      duration: "4:08",
      plays: "5,421,783",
      file: "/songs/Bairan/Hayre.mp3",
    },
  ],
},

{
  id: "BTS_Song",
  title: "Melt Away",
  artist: "BTS",
  cover: "/covers/size_m.jpg",
  color: "#0d1b3a",
  releaseDate: "5 March 2026",
  label: "HYBE",
  songs: [
    {
      id: "bts_01",
      title: "Body to Body",
      artists: "BTS",
      duration: "3:41",
      plays: "12,184,552",
      file: "/songs/BTS/bodytobody.mp3",
    },
    {
      id: "bts_02",
      title: "To The Moon",
      artists: "BTS",
      duration: "3:27",
      plays: "9,763,118",
      file: "/songs/BTS/tothemoon.mp3",
    },
  ],
}

];

export default ALBUMS;