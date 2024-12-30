interface Quote {
  text: string;
  topic: string;
  source?: string; // Optional source URL
}

const GOGGINS_QUOTES: Quote[] = [
  {
    text: "He called me and said, 'Hey, why don't we do it tomorrow?' Taking souls is what I told the motherfucker. I'm gonna run 15 today. I'll run again with you tomorrow.",
    topic: "pushing beyond limits",
    source:
      "https://www.reddit.com/r/davidgoggins/comments/whats_your_favourite_goggins_quote/",
  },
  {
    text: "When the ending is unknown and the distance is unknown, that's when you know who the fuck you are.",
    topic: "mental toughness",
    source:
      "https://www.reddit.com/r/davidgoggins/comments/whats_your_favourite_goggins_quote/",
  },
  {
    text: "Be more than motivated. Be more than driven. Become literally obsessed to the point where people think you're fucking nuts.",
    topic: "obsession with excellence",
    source:
      "https://www.reddit.com/r/davidgoggins/comments/whats_your_favourite_goggins_quote/",
  },
  {
    text: "Merry fucking Christmas!",
    topic: "intensity",
    source:
      "https://www.reddit.com/r/davidgoggins/comments/whats_your_favourite_goggins_quote/",
  },
  {
    text: "Who's gonna carry the boats?",
    topic: "leadership under pressure",
    source:
      "https://www.reddit.com/r/davidgoggins/comments/whats_your_favourite_goggins_quote/",
  },
  {
    text: "Don't stop when you're tired! Stop when you're done!",
    topic: "perseverance",
    source:
      "https://www.reddit.com/r/davidgoggins/comments/whats_your_favourite_goggins_quote/",
  },
  {
    text: "We need doctors. We need fuckin' lawyers. We need dentists. We need teachers. We also need fuckin' savages!",
    topic: "diversity of excellence",
    source:
      "https://www.reddit.com/r/davidgoggins/comments/whats_your_favourite_goggins_quote/",
  },
  {
    text: "I'm back, motherfuckers! You thought you had me. You thought you had me down, only for a second. I'm back!",
    topic: "resilience",
    source: "https://www.instagram.com/p/B3pt02sJfTO/?utm_medium=copy_link",
  },
  {
    text: "There's no finish line!",
    topic: "continuous improvement",
    source:
      "https://www.reddit.com/r/davidgoggins/comments/whats_your_favourite_goggins_quote/",
  },
  {
    text: "They don't know me, son.",
    topic: "self-belief",
    source:
      "https://www.reddit.com/r/davidgoggins/comments/whats_your_favourite_goggins_quote/",
  },
  {
    text: "It's time to take some fucking souls.",
    topic: "competitive mindset",
    source:
      "https://www.reddit.com/r/davidgoggins/comments/whats_your_favourite_goggins_quote/",
  },
  {
    text: "So now it's my turn, and I see 'David Goggins' on the chart. I sit down. God looks at me and says this is the life you were supposed to have.",
    topic: "living up to potential",
    source:
      "https://www.reddit.com/r/davidgoggins/comments/whats_your_favourite_goggins_quote/",
  },
  {
    text: "When something is bothering me or stressing me, I fix it. I don't wait for the next day.",
    topic: "immediate action",
  },
  {
    text: "There's purity in physical pursuits. It doesn't matter what your social status is. It doesn't matter how people perceive you. What matters is how long you can stay in the pool. What matters is how far you can run. In the real moments, what matters is how true you are to your words.",
    topic: "merit over status",
  },
  {
    text: "Life is one big psychological warfare you play on yourself. It's what you say to yourself every single day. You are at war with your mind every single day. Your mind is a perfect ground for training yourself.",
    topic: "mental warfare",
  },
  {
    text: "Embrace suffering. You have to suffer.",
    topic: "embracing hardship",
  },
  {
    text: "Examine your brain. Go back to the origin of your suffering. Find where your life started fucking up.",
    topic: "self-reflection",
  },
  {
    text: "I get over everything. It's water under the bridge. The grind does that. If you're worried about someone who did something to you years ago, you're not grinding. If I grind hard, I don't have time to worry about your monkey ass. I don't have time to put you in the hate bank. There's great joy in grinding. There's great joy in suffering. It cleanses your soul and makes you grow up.",
    topic: "focus and dedication",
  },
  {
    text: "I decided to face every fucking fear I have. People don't realize how these fears haunt you at night.",
    topic: "confronting fears",
  },
  {
    text: "I couldn't imagine being 50, looking back and realizing I haven't tried anything.",
    topic: "living without regrets",
  },
  {
    text: "Anything that was horrible, I went towards it. I had to callous my mind. Then I started opening different doors. I realized my potential is endless.",
    topic: "building mental toughness",
  },
  {
    text: "I always thought, 'Who would have the balls to do this? No one would. Except you. You are the baddest mofo.' I used it as fuel. Eventually, it became reality.",
    topic: "self-empowerment",
  },
  {
    text: "I realized one demotivated day is part of the progress. It's better than telling yourself you're not enough.",
    topic: "accepting setbacks",
  },
  {
    text: "If something haunts me and bothers me, I do it.",
    topic: "overcoming fears",
  },
  {
    text: "You put your self-help programs in lazy situations. Reading books on a couch. Reading at a study table. What happens in tough situations? All that self-talk goes away. But if you live through this shit...",
    topic: "action over theory",
  },
  {
    text: "I know what's on the back end of quitting. It's a lifetime of regret and asking why you quit.",
    topic: "persistence",
  },
  {
    text: "We all want to learn from books about how to get somewhere. The only way is to live through hell to get what you want. You don't learn from books. The effect is only temporary.",
    topic: "real-world experience",
  },
  {
    text: "The worst thing to believe is that at 40 years old you can't do things. You start to believe this nonsense. The worst thing is to be civilized. 'At 40 years old, I'm good.' You're never good. You've never arrived.",
    topic: "lifelong growth",
  },
  {
    text: "Triple down on your weaknesses, not on your strengths. Find out something new about yourself.",
    topic: "self-improvement",
  },
  {
    text: "A happy guy is never someone who hasn't faced something that bothered him daily.",
    topic: "growth through adversity",
  },
  {
    text: "There's a quote: in a war of 100 people, 90 people shouldn't be there. Nine people do the fighting. One person is the warrior. I'm working towards being the one. That's how I live my life.",
    topic: "exceptional mindset",
  },
  {
    text: "I put my phone and my shit away. I go dark. I go dark a lot.",
    topic: "focus and isolation",
  },
  {
    text: "Self-discipline, that's all it is.",
    topic: "discipline",
  },
  {
    text: "I believe in patience. I am a patient dude. I can watch grass grow for 20 years because that monk-like mentality is what gets you through in life.",
    topic: "patience and persistence",
  },
  {
    text: "Through repetition of things you don't want to do, you build mental armor.",
    topic: "building resilience",
  },
  {
    text: "I don't judge people anymore. Every person who did something to you has a bad past. I study them.",
    topic: "understanding others",
  },
  {
    text: "In the past, I faced my problems on a surface level. When something bad happened, I quit. 'Man, I thought I fixed this.' So I went deep into the dungeon of my soul to find out what makes me quit. I put my sword in the fire repeatedly. I said, 'We can't quit. We have to figure out why you quit.' After too much beating, I noticed my brain getting hard. You can't dissect your brain in a normal situation. Dissect your brain when it's miserable.",
    topic: "going to the dark side",
  },
];

export function getMotivationalMessage(date: Date): Quote | string {
  const hour = date.getHours();

  // Late night/early morning (12 AM - 6 AM)
  if (hour >= 0 && hour < 6) {
    return "Sleep, recover.";
  }

  // Morning workout time (6 AM - 8 AM)
  if (hour >= 6 && hour < 8) {
    return "Time to run.";
  }

  // During the day: rotate through Goggins quotes
  const quoteIndex = date.getMinutes() % GOGGINS_QUOTES.length;
  return GOGGINS_QUOTES[quoteIndex];
}
