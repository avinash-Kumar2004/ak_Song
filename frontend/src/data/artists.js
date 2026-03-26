// ─────────────────────────────────────────────────────────────────────────────
//  ARTISTS DATA — Yahan tu apne hisaab se artists add karta ja
//  img: public/artists/ folder mein image rakh, ya null chhod auto-avatar ke liye
// ─────────────────────────────────────────────────────────────────────────────

const ARTISTS = [
 {
  id: "artist_arijit",
  name: "Arijit Singh",
  img: "/artists/arjit.jpg",
  genre: "Bollywood",
  followers: "12,487,921",
  bio: "India's most-streamed vocalist",
  songs: [
    {
      id: "arj_01",
      title: "Channa Mereya",
      album: "Ae Dil Hai Mushkil",
      duration: "4:49",
      plays: "189,542,778",
      file: "/songs/arjit/channa.mp3",
    },
    {
      id: "arj_02",
      title: "Janam Janam",
      album: "Dilwale",
      duration: "3:58",
      plays: "167,331,209",
      file: "/songs/arjit/janam.mp3",
    },
    {
      id: "arj_03",
      title: "Tum Hi Ho",
      album: "Aashiqui 2",
      duration: "4:22",
      plays: "272,884,113",
      file: "/songs/arjit/tum.mp3",
    },
  ],
},
 
 
 {
  id: "artist_pritam",
  name: "Pritam",
  img: "/artists/pritam.jpg",
  genre: "Film Composer",
  followers: "5,742,118",
  bio: "Bollywood's hitmaker",
  songs: [
    {
      id: "prt_01",
      title: "Kabira",
      album: "Yeh Jawaani Hai Deewani",
      duration: "4:27",
      plays: "155,884,321",
      file: "/songs/pritam/kabira.mp3",
    },
    {
      id: "prt_02",
      title: "Ilahi",
      album: "Yeh Jawaani Hai Deewani",
      duration: "3:53",
      plays: "132,441,908",
      file: "/songs/pritam/janena.mp3",
    },
    {
      id: "prt_03",
      title: "Tu Jaane Na",
      album: "Ajab Prem Ki Ghazab Kahani",
      duration: "5:41",
      plays: "198,772,654",
      file: "/songs/pritam/tune.mp3",
    },
    {
      id: "prt_04",
      title: "Ae Dil Hai Mushkil",
      album: "Ae Dil Hai Mushkil",
      duration: "4:29",
      plays: "176,553,210",
      file: "/songs/pritam/dil.mp3",
    },
  ],
},
{
  id: "artist_udit",
  name: "Udit Narayan",
  img: "/artists/udit.jpg",
  genre: "Playback Singer",
  followers: "6,128,554",
  bio: "Legendary Bollywood playback singer known for 90s hits",
  songs: [
    {
      id: "udt_01",
      title: "Aankhein Khuli",
      album: "Mohabbatein",
      duration: "7:02",
      plays: "182,554,210",
      file: "/songs/udit/ankehinkuli.mp3",
    },
    {
      id: "udt_02",
      title: "Agar Tum Mil Jao",
      album: "Zeher",
      duration: "5:05",
      plays: "143,221,987",
      file: "/songs/udit/agartum.mp3",
    },
    {
      id: "udt_03",
      title: "Main Yahaan Hoon",
      album: "Veer-Zaara",
      duration: "4:55",
      plays: "198,774,332",
      file: "/songs/udit/yehahoon.mp3",
    },
    {
      id: "udt_04",
      title: "Sona Kitna Sona Hai",
      album: "Hero No. 1",
      duration: "4:46",
      plays: "121,664,889",
      file: "/songs/udit/sonakitna.mp3",
    },
  ],
},
{
  id: "artist_alka",
  name: "Alka Yagnik",
  img: "/artists/alka.avif",
  genre: "Playback Singer",
  followers: "6,845,219",
  bio: "Legendary Bollywood playback singer known for iconic 90s and 2000s hits",
  songs: [
    {
      id: "alka_01",
      title: "Chura Ke Dil Mera",
      album: "Main Khiladi Tu Anari",
      duration: "7:12",
      plays: "210,554,321",
      file: "/songs/alka/chura.mp3",
    },
    {
      id: "alka_02",
      title: "Aaye Ho Meri Zindagi Mein",
      album: "Raja Hindustani",
      duration: "6:02",
      plays: "189,221,876",
      file: "/songs/alka/ayeho.mp3",
    },
    {
      id: "alka_03",
      title: "Main Agar Saamne",
      album: "Raaz",
      duration: "5:58",
      plays: "167,332,445",
      file: "/songs/alka/main.mp3",
    },
    {
      id: "alka_04",
      title: "Taal Se Taal Mila",
      album: "Taal",
      duration: "5:20",
      plays: "198,774,120",
      file: "/songs/alka/taal.mp3",
    },
    {
      id: "alka_05",
      title: "Teri Chunnariya",
      album: "Hello Brother",
      duration: "5:56",
      plays: "154,663,210",
      file: "/songs/alka/teri.mp3",
    },
  ],
},
{
  id: "AR Rehman",
  name: "AR Rehman",
  img: "/artists/ar.webp",
  genre: "Playback Singer",
  followers: "6,845,219",
  bio: "Legendary Bollywood playback singer known for iconic 90s and 2000s hits",
  songs: [
    {
      id: "ar_01",
      title: "Aawaara Angaara",
      album: "Aawaara Angaara ",
      duration: "4:30",
      plays: "210,554,321",
      file: "/songs/rehman/awara.mp3",
    },
    
  ],
},

{
  id: "jubin_nautiyal",
  name: "Jubin Nautiyal",
  img: "/artists/jubin.jpg",
  genre: "Playback Singer",
  followers: "6,845,219",

  bio: "Popular Bollywood playback singer known for soulful romantic songs like Humnava Mere and Lut Gaye",

  songs: [
    {
      id: "jb_01",
      title: "Humnava Mere",
      album: "Humnava Mere",
      duration: "3:30", // (verify from file if needed)
      plays: "210,554,321",
      file: "/songs/jubin/ham.mp3",
    },
  ],
},
{
  id: "badshah",
  name: "Badshah",
  img: "/artists/bad.jpg",
  genre: "Rapper / Playback Singer",
  followers: "6,845,219",

  bio: "Popular Indian rapper and music producer known for party hits and commercial Bollywood tracks",

  songs: [
    {
      id: "bad_01",
      title: "Genda Phool",
      album: "Genda Phool",
      duration: "3:30", // better to auto-fetch
      plays: "210,554,321",
      file: "/songs/badshah/genda.mp3",
    },
  ],
}



  // ── Naaye artists add karna ho to yahan neeche paste karo ─────────────────
  // {
  //   id: "artist_xyz",
  //   name: "Artist Name",
  //   img: "/artists/xyz.jpg",    ← ya null
  //   genre: "Genre",
  //   followers: "1M",
  //   bio: "Short bio",
  //   songs: [
  //     { id: "xyz_01", title: "Song", album: "Album", duration: "3:30", plays: "5M", file: "/songs/xyz.mp3" },
  //   ],
  // },
];

export default ARTISTS;