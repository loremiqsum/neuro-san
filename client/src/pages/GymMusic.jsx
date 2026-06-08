import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Music, Shuffle, Filter, Play, Pause, SkipForward, SkipBack, Plus, X, ExternalLink } from 'lucide-react';

// ─── Built-in track library ────────────────────────────────────────────────
const BUILTIN_TRACKS = [
  // ── English ──────────────────────────────────────────────────────────────
  { title: "Lose Yourself", artist: "Eminem", lang: "EN", ytId: "xFYQQPAOz7Y" },
  { title: "Till I Collapse", artist: "Eminem ft. Nate Dogg", lang: "EN", ytId: "ytQ5CYE1VZw" },
  { title: "Remember The Name", artist: "Fort Minor", lang: "EN", ytId: "VDvr08sCPOc" },
  { title: "Stronger", artist: "Kanye West", lang: "EN", ytId: "PsO6ZnUZI0g" },
  { title: "POWER", artist: "Kanye West", lang: "EN", ytId: "L53gjP-TtGE" },
  { title: "Can't Hold Us", artist: "Macklemore & Ryan Lewis", lang: "EN", ytId: "2zNSgSzhBfM" },
  { title: "Thunderstruck", artist: "AC/DC", lang: "EN", ytId: "v2AC41dglnM" },
  { title: "Eye of the Tiger", artist: "Survivor", lang: "EN", ytId: "btPJPFnesV4" },
  { title: "Centuries", artist: "Fall Out Boy", lang: "EN", ytId: "LBr7kECJGKQ" },
  { title: "Warriors", artist: "Imagine Dragons", lang: "EN", ytId: "fmI_Ndrxy14" },
  { title: "Radioactive", artist: "Imagine Dragons", lang: "EN", ytId: "ktvTqknDobU" },
  { title: "Whatever It Takes", artist: "Imagine Dragons", lang: "EN", ytId: "gOsM-DYAEhY" },
  { title: "Believer", artist: "Imagine Dragons", lang: "EN", ytId: "7wtfhZwyrcc" },
  { title: "Natural", artist: "Imagine Dragons", lang: "EN", ytId: "0I647GU3Jsc" },
  { title: "Demons", artist: "Imagine Dragons", lang: "EN", ytId: "mWRsgZuwf_8" },
  { title: "Enter Sandman", artist: "Metallica", lang: "EN", ytId: "CD-E-LDc384" },
  { title: "Fuel", artist: "Metallica", lang: "EN", ytId: "PvF9PAxe5Ng" },
  { title: "Bodies", artist: "Drowning Pool", lang: "EN", ytId: "04F4xlWSFh0" },
  { title: "Headstrong", artist: "Trapt", lang: "EN", ytId: "HTvu1Yr3Ohk" },
  { title: "X Gon' Give It To Ya", artist: "DMX", lang: "EN", ytId: "fGx6K90TmCI" },
  { title: "Humble", artist: "Kendrick Lamar", lang: "EN", ytId: "tvTRZJ-4EyI" },
  { title: "DNA", artist: "Kendrick Lamar", lang: "EN", ytId: "NLZRYQMLDW4" },
  { title: "Sicko Mode", artist: "Travis Scott", lang: "EN", ytId: "6ONRf7h3Mdk" },
  { title: "HIGHEST IN THE ROOM", artist: "Travis Scott", lang: "EN", ytId: "tfSS1e3kYeo" },
  { title: "Run This Town", artist: "Jay-Z ft. Rihanna & Kanye", lang: "EN", ytId: "wFB1ywAMBMg" },
  { title: "All I Do Is Win", artist: "DJ Khaled ft. T-Pain", lang: "EN", ytId: "GGXzlRoNtHU" },
  { title: "Blinding Lights", artist: "The Weeknd", lang: "EN", ytId: "4NRXx6U8ABQ" },
  { title: "Starboy", artist: "The Weeknd ft. Daft Punk", lang: "EN", ytId: "34Na4j8AVgA" },
  { title: "Pump It", artist: "The Black Eyed Peas", lang: "EN", ytId: "ZaI2IlHwmgQ" },
  { title: "Boom Boom Pow", artist: "The Black Eyed Peas", lang: "EN", ytId: "4m48GqaOz90" },
  { title: "Seven Nation Army", artist: "The White Stripes", lang: "EN", ytId: "0J2QdDbelmY" },
  { title: "We Will Rock You", artist: "Queen", lang: "EN", ytId: "-tJYN-eG1zk" },
  { title: "Don't Stop Me Now", artist: "Queen", lang: "EN", ytId: "HgzGwKwLmgM" },
  { title: "Another One Bites the Dust", artist: "Queen", lang: "EN", ytId: "rY0WxgSXdEE" },
  { title: "Smells Like Teen Spirit", artist: "Nirvana", lang: "EN", ytId: "hTWKbfoikeg" },
  { title: "Back in Black", artist: "AC/DC", lang: "EN", ytId: "pAgnJDJN4VA" },
  { title: "Highway to Hell", artist: "AC/DC", lang: "EN", ytId: "l482T0yNkeo" },
  { title: "Welcome to the Jungle", artist: "Guns N' Roses", lang: "EN", ytId: "o1tj2zJ2Wvg" },
  { title: "Paradise City", artist: "Guns N' Roses", lang: "EN", ytId: "Rbm6GXllBiw" },
  { title: "Cochise", artist: "Audioslave", lang: "EN", ytId: "KDMvN45sjo0" },
  { title: "No Church in the Wild", artist: "Jay-Z & Kanye West", lang: "EN", ytId: "FJt7gNi3Nr4" },
  { title: "Survival", artist: "Eminem", lang: "EN", ytId: "NlmezywdxPI" },
  { title: "Rap God", artist: "Eminem", lang: "EN", ytId: "XbGs_qK2PQA" },
  { title: "Not Afraid", artist: "Eminem", lang: "EN", ytId: "j5-yKhDd64s" },
  { title: "The Search", artist: "NF", lang: "EN", ytId: "fnlJw9H0xAM" },
  { title: "When I Grow Up", artist: "NF", lang: "EN", ytId: "4VLqMfhJkUM" },
  { title: "Godzilla", artist: "Eminem ft. Juice WRLD", lang: "EN", ytId: "r_0JjYUe5jo" },
  { title: "Rockstar", artist: "Post Malone ft. 21 Savage", lang: "EN", ytId: "UceaB4D0jpo" },
  { title: "Congratulations", artist: "Post Malone ft. Quavo", lang: "EN", ytId: "SC4xMk98Pdc" },
  { title: "Walk", artist: "Pantera", lang: "EN", ytId: "AkFqg5wAuFk" },
  { title: "Killing in the Name", artist: "Rage Against the Machine", lang: "EN", ytId: "bWXazVhlyxQ" },
  { title: "Bulls on Parade", artist: "Rage Against the Machine", lang: "EN", ytId: "3L4YrGaR8E4" },
  { title: "Last Resort", artist: "Papa Roach", lang: "EN", ytId: "j0lSpNtjPM8" },
  { title: "Break Stuff", artist: "Limp Bizkit", lang: "EN", ytId: "ZpUYjpKg9KY" },
  { title: "Rollin'", artist: "Limp Bizkit", lang: "EN", ytId: "RYnFIRc0k6E" },
  { title: "Numb", artist: "Linkin Park", lang: "EN", ytId: "kXYiU_JCYtU" },
  { title: "In The End", artist: "Linkin Park", lang: "EN", ytId: "eVTXPUF4Oz4" },
  { title: "Faint", artist: "Linkin Park", lang: "EN", ytId: "LYU-8IFcDPw" },
  { title: "Bleed It Out", artist: "Linkin Park", lang: "EN", ytId: "OnuuYcqhzCE" },
  { title: "Given Up", artist: "Linkin Park", lang: "EN", ytId: "0xyxtzD54rM" },
  { title: "New Divide", artist: "Linkin Park", lang: "EN", ytId: "ysSxxIqKNN0" },
  { title: "What I've Done", artist: "Linkin Park", lang: "EN", ytId: "8sgycukafqQ" },
  { title: "Monster", artist: "Skillet", lang: "EN", ytId: "1mjlM_RnsVE" },
  { title: "Hero", artist: "Skillet", lang: "EN", ytId: "uGcsIdGOuZY" },
  { title: "Feel Invincible", artist: "Skillet", lang: "EN", ytId: "Qzw6A2WC5Qo" },
  { title: "Courtesy Call", artist: "Thousand Foot Krutch", lang: "EN", ytId: "ocpDEOXABWg" },
  { title: "Through the Fire and Flames", artist: "DragonForce", lang: "EN", ytId: "0jgrCKhxE1s" },
  { title: "Sail", artist: "AWOLNATION", lang: "EN", ytId: "tgIqecROs5M" },
  { title: "Courtesy Call", artist: "Thousand Foot Krutch", lang: "EN", ytId: "ocpDEOXABWg" },
  { title: "Shipping Up to Boston", artist: "Dropkick Murphys", lang: "EN", ytId: "x-64CaD8GXw" },
  { title: "Crazy Train", artist: "Ozzy Osbourne", lang: "EN", ytId: "tMDFv4m7oEo" },
  { title: "Immigrant Song", artist: "Led Zeppelin", lang: "EN", ytId: "y8OtzJtp-EM" },
  { title: "Gonna Fly Now (Rocky)", artist: "Bill Conti", lang: "EN", ytId: "ioE_O7Lm0I4" },
  { title: "Renegade", artist: "Jay-Z & Eminem", lang: "EN", ytId: "xEch1NFXA_0" },
  { title: "'Till I Collapse (Remix)", artist: "Eminem ft. 50 Cent", lang: "EN", ytId: "PGigkNtBeRU" },
  { title: "Dream On", artist: "Aerosmith", lang: "EN", ytId: "89dGC8de0CA" },
  { title: "Unstoppable", artist: "The Score", lang: "EN", ytId: "P0ZmFGkGbmg" },
  { title: "Legend", artist: "The Score", lang: "EN", ytId: "Lu09Xi49VzE" },
  { title: "Born for This", artist: "The Score", lang: "EN", ytId: "I4RTIhHjuJo" },
  { title: "Hall of Fame", artist: "The Script ft. will.i.am", lang: "EN", ytId: "mk48xRzuNvA" },
  { title: "No Easy Way Out", artist: "Robert Tepper", lang: "EN", ytId: "MwPb7g_BlXQ" },
  { title: "Hearts on Fire", artist: "John Cafferty (Rocky IV)", lang: "EN", ytId: "swo51-CG9Mw" },
  { title: "Holding Out for a Hero", artist: "Bonnie Tyler", lang: "EN", ytId: "bWcASV2sey0" },
  { title: "Venom", artist: "Eminem", lang: "EN", ytId: "8CdcCD5V-d8" },
  { title: "Lucky You", artist: "Eminem ft. Joyner Lucas", lang: "EN", ytId: "jLhMVPB1Mnk" },
  { title: "Ambitionz Az a Ridah", artist: "2Pac", lang: "EN", ytId: "bfDGiiWPuoo" },
  { title: "Hit 'Em Up", artist: "2Pac", lang: "EN", ytId: "41qC3w3UUkU" },
  { title: "Power Trip", artist: "J. Cole ft. Miguel", lang: "EN", ytId: "7AjD7nKiUQ4" },
  { title: "Jumpman", artist: "Drake & Future", lang: "EN", ytId: "lqZ-_RSmxcM" },
  { title: "Black Skinhead", artist: "Kanye West", lang: "EN", ytId: "q604eed4ad0" },
  { title: "Titanium", artist: "David Guetta ft. Sia", lang: "EN", ytId: "JRfuAukYTKg" },
  { title: "The Pretender", artist: "Foo Fighters", lang: "EN", ytId: "SBjQ9tuuTJQ" },
  { title: "All My Life", artist: "Foo Fighters", lang: "EN", ytId: "xQ04WbGI2HI" },
  { title: "I Will Not Bow", artist: "Breaking Benjamin", lang: "EN", ytId: "7qrRzNidzIc" },
  { title: "Diary of Jane", artist: "Breaking Benjamin", lang: "EN", ytId: "DWaB4PXCwFU" },

  // ── Hindi ────────────────────────────────────────────────────────────────
  { title: "Apna Time Aayega", artist: "Ranveer Singh (Gully Boy)", lang: "HI", ytId: "jFGKJBPFdUA" },
  { title: "Sultan - Title Track", artist: "Sukhwinder Singh & Shadab Faridi", lang: "HI", ytId: "XnpWZVCbfGo" },
  { title: "Dangal - Title Track", artist: "Daler Mehndi", lang: "HI", ytId: "ChcR2gKt5WM" },
  { title: "Brothers Anthem", artist: "Vishal Dadlani", lang: "HI", ytId: "5zoTLwrm9QE" },
  { title: "Ziddi Dil", artist: "Vishal Dadlani (Mary Kom)", lang: "HI", ytId: "NLqAfk-WKKA" },
  { title: "Kar Har Maidaan Fateh", artist: "Sukhwinder Singh (Sanju)", lang: "HI", ytId: "DXBR0SJkiWo" },
  { title: "Chak De India", artist: "Sukhwinder Singh", lang: "HI", ytId: "8cHRisiGNQc" },
  { title: "Malhari", artist: "Vishal Dadlani (Bajirao Mastani)", lang: "HI", ytId: "l_MyUGq7pgs" },
  { title: "Khalibali", artist: "Shivam Pathak (Padmaavat)", lang: "HI", ytId: "v7K4vGYL9zI" },
  { title: "Sher Khul Gaye", artist: "Arijit Singh (Fighter)", lang: "HI", ytId: "r-mTMKyEuqY" },
  { title: "Deva Shree Ganesha", artist: "Ajay-Atul (Agneepath)", lang: "HI", ytId: "H8W4YnjRVHY" },
  { title: "Tattad Tattad", artist: "Arijit Singh (Goliyon Ki Raasleela)", lang: "HI", ytId: "i05Am2XUOI4" },
  { title: "Ghungroo", artist: "Arijit Singh & Shilpa Rao (War)", lang: "HI", ytId: "qFkNATtc3mc" },
  { title: "Jai Ho", artist: "A.R. Rahman & Sukhwinder", lang: "HI", ytId: "xwwAVRyNmgQ" },
  { title: "Zinda", artist: "Siddharth Mahadevan (Bhaag Milkha Bhaag)", lang: "HI", ytId: "ik_VK-mGGjQ" },
  { title: "Ainvayi Ainvayi", artist: "Salim-Sulaiman (Band Baaja Baaraat)", lang: "HI", ytId: "qLlN1IKSB-Q" },
  { title: "Nashe Si Chadh Gayi", artist: "Arijit Singh (Befikre)", lang: "HI", ytId: "Wd2B8OAotU8" },
  { title: "Badtameez Dil", artist: "Benny Dayal (Yeh Jawaani Hai Deewani)", lang: "HI", ytId: "II2EO3Nw4Q0" },
  { title: "Balam Pichkari", artist: "Vishal Dadlani (Yeh Jawaani Hai Deewani)", lang: "HI", ytId: "0WtRNGubWGA" },
  { title: "Dhoom Machale", artist: "Sunidhi Chauhan (Dhoom)", lang: "HI", ytId: "sDx-Mf-KBf0" },
  { title: "Get Ready to Fight", artist: "JENIL (Baaghi)", lang: "HI", ytId: "bDdigMpN0GQ" },
  { title: "Seeti Maar", artist: "Kamaal Khan (Radhe)", lang: "HI", ytId: "NOoRGhBVb_U" },
  { title: "Muqabla", artist: "A.R. Rahman (Street Dancer 3D)", lang: "HI", ytId: "UR2YWN1dqjY" },
  { title: "Garmi", artist: "Badshah & Neha Kakkar (Street Dancer 3D)", lang: "HI", ytId: "IL_FmhQgK8E" },
  { title: "Jumme Ki Raat", artist: "Mika Singh (Kick)", lang: "HI", ytId: "FyJkKBjwi0Y" },
  { title: "Party All Night", artist: "Honey Singh (Boss)", lang: "HI", ytId: "urqecuiVi9M" },
  { title: "Lungi Dance", artist: "Honey Singh (Chennai Express)", lang: "HI", ytId: "AI3FVp-YdOI" },
  { title: "Swag Se Swagat", artist: "Vishal Dadlani (Tiger Zinda Hai)", lang: "HI", ytId: "vLXS0EKea-A" },
  { title: "Saara Zamana", artist: "Raghav (Street Dancer 3D)", lang: "HI", ytId: "eU-UsvYligk" },
  { title: "Suno Gaur Se Duniya Walo", artist: "Shankar Mahadevan", lang: "HI", ytId: "jBYCMHjhF8A" },
  { title: "Lakshya - Title Track", artist: "Shankar Mahadevan", lang: "HI", ytId: "hPJ7MtZqGYo" },
  { title: "Dhoom Again", artist: "Vishal Dadlani (Dhoom 2)", lang: "HI", ytId: "3K0S6tGJ5Kk" },
  { title: "Bang Bang", artist: "Vishal-Shekhar (Bang Bang)", lang: "HI", ytId: "BI_jFCgCqqs" },
  { title: "Dil Dhadakne Do - Title Track", artist: "Priyanka Chopra & Farhan", lang: "HI", ytId: "9HjuB-8rYEw" },
  { title: "Sadda Haq", artist: "Mohit Chauhan (Rockstar)", lang: "HI", ytId: "7_PsaGpSgY0" },
  { title: "Nadaan Parindey", artist: "A.R. Rahman (Rockstar)", lang: "HI", ytId: "kYQIWqNf0FU" },
  { title: "Gallan Goodiyaan", artist: "Yashita Sharma (Dil Dhadakne Do)", lang: "HI", ytId: "jCEdTq3j-0U" },
  { title: "Saturday Saturday", artist: "Badshah (Humpty Sharma Ki Dulhania)", lang: "HI", ytId: "RTSKw400RMc" },
  { title: "Kala Chashma", artist: "Badshah & Neha Kakkar (Baar Baar Dekho)", lang: "HI", ytId: "k4yXQPm49Xk" },
  { title: "Kar Gayi Chull", artist: "Badshah & Neha Kakkar (Kapoor & Sons)", lang: "HI", ytId: "NTHz9ephYTw" },
  { title: "High Heels", artist: "Honey Singh (Ki & Ka)", lang: "HI", ytId: "mZA60mNJgoU" },
  { title: "Abhi Toh Party Shuru Hui Hai", artist: "Badshah (Khoobsurat)", lang: "HI", ytId: "8HkIXAYCsNE" },
  { title: "London Thumakda", artist: "Labh Janjua (Queen)", lang: "HI", ytId: "udra3Mfw2oo" },
  { title: "Manma Emotion Jaage", artist: "Amit Mishra (Dilwale)", lang: "HI", ytId: "dibuHTBgSmA" },
  { title: "Afghan Jalebi", artist: "Swaroop Khan (Phantom)", lang: "HI", ytId: "hq3-kDHH4EI" },
  { title: "Tamma Tamma Again", artist: "Badshah & Anuradha (Badrinath Ki Dulhania)", lang: "HI", ytId: "5rO3jPMZFAk" },
  { title: "Dil Luteya", artist: "Jazzy B", lang: "HI", ytId: "MxjdfUv5hMI" },
  { title: "Mundian To Bach Ke", artist: "Panjabi MC", lang: "HI", ytId: "DJztXj2GPfk" },
  { title: "Tunak Tunak Tun", artist: "Daler Mehndi", lang: "HI", ytId: "vTIIMJ9tUc8" },
  { title: "Bole Chudiyan", artist: "Udit Narayan (K3G)", lang: "HI", ytId: "S-dDnmhMqRw" },
  { title: "Chaiyya Chaiyya", artist: "Sukhwinder Singh (Dil Se)", lang: "HI", ytId: "yocbfHlxn5g" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function extractYtId(input) {
  if (/^[A-Za-z0-9_-]{11}$/.test(input.trim())) return input.trim();
  try {
    const url = new URL(input);
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1).split('/')[0];
    return url.searchParams.get('v') || null;
  } catch {
    return null;
  }
}

const LS_KEY = 'gym_custom_tracks';
function loadCustom() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveCustom(tracks) {
  localStorage.setItem(LS_KEY, JSON.stringify(tracks));
}

// ─── YouTube IFrame Player hook ────────────────────────────────────────────
function useYouTubePlayer(containerId, onEnd) {
  const playerRef = useRef(null);
  const onEndRef = useRef(onEnd);
  useEffect(() => { onEndRef.current = onEnd; }, [onEnd]);

  useEffect(() => {
    if (window.YT && window.YT.Player) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }, []);

  const init = useCallback((videoId) => {
    function create() {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      playerRef.current = new window.YT.Player(containerId, {
        height: '0',
        width: '0',
        videoId,
        playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, modestbranding: 1 },
        events: {
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) onEndRef.current?.();
          },
        },
      });
    }
    if (window.YT && window.YT.Player) { create(); return; }
    window.onYouTubeIframeAPIReady = create;
  }, [containerId]);

  const play = useCallback((videoId) => {
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(videoId);
    } else {
      init(videoId);
    }
  }, [init]);

  const pause = useCallback(() => playerRef.current?.pauseVideo?.(), []);
  const resume = useCallback(() => playerRef.current?.playVideo?.(), []);

  return { play, pause, resume, init };
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function GymMusic() {
  const [filter, setFilter] = useState('ALL');
  const [seed, setSeed] = useState(0);
  const [customTracks, setCustomTracks] = useState(loadCustom);
  const [showAdd, setShowAdd] = useState(false);
  const [addUrl, setAddUrl] = useState('');
  const [addTitle, setAddTitle] = useState('');
  const [addArtist, setAddArtist] = useState('');
  const [addLang, setAddLang] = useState('EN');
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const trackListRef = useRef(null);

  const allTracks = useMemo(() => {
    const seen = new Set();
    return [...BUILTIN_TRACKS, ...customTracks].filter((t) => {
      if (seen.has(t.ytId)) return false;
      seen.add(t.ytId);
      return true;
    });
  }, [customTracks]);

  const shuffled = useMemo(() => shuffle(allTracks), [seed, allTracks]);

  const filtered = filter === 'ALL'
    ? shuffled
    : shuffled.filter((t) => t.lang === filter);

  const prevIdxRef = useRef(-1);

  function handleEnd() {
    setCurrentIdx((prev) => {
      const next = prev + 1 < filtered.length ? prev + 1 : 0;
      prevIdxRef.current = -1;
      return next;
    });
    setIsPlaying(true);
  }

  const { play, pause, resume } = useYouTubePlayer('yt-player', handleEnd);

  // When currentIdx changes, play that track
  useEffect(() => {
    if (currentIdx >= 0 && currentIdx < filtered.length && currentIdx !== prevIdxRef.current) {
      play(filtered[currentIdx].ytId);
      prevIdxRef.current = currentIdx;
    }
  }, [currentIdx, filtered, play]);

  function playTrack(idx) {
    setCurrentIdx(idx);
    setIsPlaying(true);
  }

  function handlePlay(idx) {
    if (currentIdx === idx && isPlaying) {
      pause();
      setIsPlaying(false);
    } else if (currentIdx === idx && !isPlaying) {
      resume();
      setIsPlaying(true);
    } else {
      playTrack(idx);
    }
  }

  function handlePrev() {
    const next = currentIdx - 1 >= 0 ? currentIdx - 1 : filtered.length - 1;
    playTrack(next);
  }
  function handleNext() {
    const next = currentIdx + 1 < filtered.length ? currentIdx + 1 : 0;
    playTrack(next);
  }

  function handleAddSong(e) {
    e.preventDefault();
    const ytId = extractYtId(addUrl);
    if (!ytId) return;
    const newTrack = {
      title: addTitle.trim() || 'Custom Track',
      artist: addArtist.trim() || 'Unknown',
      lang: addLang,
      ytId,
      custom: true,
    };
    const updated = [...customTracks, newTrack];
    setCustomTracks(updated);
    saveCustom(updated);
    setAddUrl(''); setAddTitle(''); setAddArtist('');
    setShowAdd(false);
  }

  function handleRemoveCustom(ytId) {
    const updated = customTracks.filter((t) => t.ytId !== ytId);
    setCustomTracks(updated);
    saveCustom(updated);
  }

  const nowPlaying = currentIdx >= 0 && currentIdx < filtered.length ? filtered[currentIdx] : null;

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-6 pb-48" ref={trackListRef}>
      {/* Hidden YouTube player */}
      <div id="yt-player" className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Music size={24} className="text-gym-accent" />
          Gym Beats
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gym-input border border-gym-border text-green-400 hover:border-green-400 hover:bg-green-400/10 transition-all"
          >
            <Plus size={14} />
            Add
          </button>
          <button
            onClick={() => { setSeed((s) => s + 1); setCurrentIdx(-1); setIsPlaying(false); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gym-input border border-gym-border text-gym-accent hover:border-gym-accent hover:bg-gym-accent/10 transition-all"
          >
            <Shuffle size={14} />
            Shuffle
          </button>
        </div>
      </div>
      <p className="text-gym-muted text-sm mb-4">
        Tap any track to play. Music auto-advances to next song.
      </p>

      {/* Add song form */}
      {showAdd && (
        <form onSubmit={handleAddSong} className="bg-gym-card border border-gym-border rounded-xl p-3 mb-4 space-y-2">
          <p className="text-xs font-semibold text-gym-text">Add a Song</p>
          <input
            type="text"
            placeholder="YouTube URL or Video ID *"
            value={addUrl}
            onChange={(e) => setAddUrl(e.target.value)}
            className="w-full px-3 py-2 bg-gym-input border border-gym-border rounded-lg text-sm text-gym-text placeholder:text-gym-muted/50 focus:outline-none focus:border-gym-accent"
            required
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Title"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              className="flex-1 px-3 py-2 bg-gym-input border border-gym-border rounded-lg text-sm text-gym-text placeholder:text-gym-muted/50 focus:outline-none focus:border-gym-accent"
            />
            <input
              type="text"
              placeholder="Artist"
              value={addArtist}
              onChange={(e) => setAddArtist(e.target.value)}
              className="flex-1 px-3 py-2 bg-gym-input border border-gym-border rounded-lg text-sm text-gym-text placeholder:text-gym-muted/50 focus:outline-none focus:border-gym-accent"
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={addLang}
              onChange={(e) => setAddLang(e.target.value)}
              className="px-3 py-2 bg-gym-input border border-gym-border rounded-lg text-sm text-gym-text focus:outline-none focus:border-gym-accent"
            >
              <option value="EN">English</option>
              <option value="HI">Hindi</option>
            </select>
            <button
              type="submit"
              className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add Song
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="py-2 px-3 bg-gym-input border border-gym-border text-gym-muted text-sm rounded-lg hover:border-red-400 hover:text-red-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'ALL', label: 'All' },
          { key: 'EN', label: 'English' },
          { key: 'HI', label: 'Hindi' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setCurrentIdx(-1); setIsPlaying(false); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              filter === key
                ? 'bg-gym-accent text-white border-gym-accent'
                : 'bg-gym-input text-gym-muted border-gym-border hover:border-gym-accent/50'
            }`}
          >
            <Filter size={10} className="inline mr-1" />
            {label}
          </button>
        ))}
        <span className="text-[10px] text-gym-muted self-center ml-auto">
          {filtered.length} tracks
        </span>
      </div>

      {/* Track list */}
      <div className="space-y-1.5 mb-6">
        {filtered.map((track, i) => {
          const isCurrent = currentIdx === i;
          return (
            <div
              key={`${track.ytId}-${seed}-${i}`}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all border cursor-pointer group ${
                isCurrent
                  ? 'bg-gym-accent/15 border-gym-accent'
                  : 'bg-gym-card border-gym-border hover:border-gym-accent/50 hover:bg-gym-accent/5'
              }`}
              onClick={() => handlePlay(i)}
            >
              {/* Play/Pause indicator */}
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {isCurrent && isPlaying ? (
                  <Pause size={14} className="text-gym-accent" />
                ) : isCurrent ? (
                  <Play size={14} className="text-gym-accent" />
                ) : (
                  <span className="text-xs text-gym-muted font-mono">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate transition-colors ${
                  isCurrent ? 'text-gym-accent-light' : 'text-gym-text group-hover:text-gym-accent-light'
                }`}>
                  {track.title}
                </p>
                <p className="text-xs text-gym-muted truncate">{track.artist}</p>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                track.lang === 'HI'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {track.lang}
              </span>
              {track.custom && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveCustom(track.ytId); }}
                  className="text-gym-muted hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              <a
                href={`https://music.youtube.com/watch?v=${track.ytId}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gym-muted hover:text-gym-accent shrink-0 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          );
        })}
      </div>

      {/* Now Playing bar (fixed at bottom, above nav) */}
      {nowPlaying && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-gym-card/95 backdrop-blur-sm border-t border-gym-border">
          <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gym-accent-light truncate">
                {nowPlaying.title}
              </p>
              <p className="text-xs text-gym-muted truncate">{nowPlaying.artist}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="p-1.5 text-gym-muted hover:text-gym-text transition-colors">
                <SkipBack size={18} />
              </button>
              <button
                onClick={() => {
                  if (isPlaying) { pause(); setIsPlaying(false); }
                  else { resume(); setIsPlaying(true); }
                }}
                className="p-2 bg-gym-accent rounded-full text-white hover:bg-gym-accent-light transition-colors"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button onClick={handleNext} className="p-1.5 text-gym-muted hover:text-gym-text transition-colors">
                <SkipForward size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
