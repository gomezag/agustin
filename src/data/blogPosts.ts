import ardugarden from '../assets/ardugarden1.jpeg'
import gdrivepos from '../assets/google-drive-pos.png'
import esprf from '../assets/espRF.jpeg'
import aranduayala from '../assets/aranduayala.png'
import ejumina from '../assets/ejumina.png'
import laliga from '../assets/laliga.png'
import arduplanter from '../assets/arduplanter.jpeg'
import { BlogPostData } from '../types'
const radius=90;

export const blogPosts:BlogPostData[] = [
  {
    title: "A couple more pages",
    excerpt: "I'm starting to use AI coders. They are allowing me to create tons of web pages and implement ideas that would've taken a lot of effort to learn how to implement. Just now, i've managed to implement this page using React and Vercel without much consultation to their respectives documentation. \n I have also added this page to the web for a sculptor friend. \n Check it out, he has very cool sculptures, and don't be shy to ask about shipping if you'd like one in your living room!",
    date: "2024-03-15",
    imageUrl: aranduayala,
    tags: ["WebDev"],
    radius: radius,
    links: [
      {
        url: 'https://www.aranduayala.com',
        text: 'www.aranduayala.com'
      }
    ]
  },
  {
    title: "Commissioned work",
    excerpt: "This was my first webpage that I did from scratch by commission. It is a very toned down version of Attendium, if you know what that is (if not, you can google it). It was a nice experience to have someone actually paying for what I could deliver, even if what I could/want to deliver was not like super pretty, it was pretty useful. Too bad the domain expired and I don't own it anymore, or that the bar closed down eventually.",
    date: "2024-03-15",
    imageUrl: ejumina,
    tags: ["WebDev"],
    radius: radius,
    links: [
      {
        url: 'https://ejumina.vercel.app',
        text: 'Ejumina Test'
      }
    ]
  },
  {
    title: "ESPHome controllers",
    excerpt: "In the showcase today: How I'm using ESPHome to add interfaces to my Home Assistant. This dirty looking gadget is an ESP8266 I had lying around to which I've added an RF 433MHz Rx module and an IR sensor. It sits next to my TV and interfaces with different remote controllers. The code is esentially a yaml file, although in my case I needed to compile it for an older version since my rflibs seemed to have some issues.",
    date: "2021-03-05",
    imageUrl: esprf,
    tags: ["Hardware", "RF"],
    radius: radius,
    links: []
  },
  {
    title: "My first arduino project.",
    excerpt: "What's nice about avoiding throwing things and getting old is finding jewels like this one. It was a very crude pair of relays, connected to a transistor board that was supposed to be integrated at some point, connected to the arduino I/O ports. I'd wish I had a picture of the setup, but it seems that has been lost to time. I'll update with pictures of the new sensor box.",
    date: "2013-01-01",
    imageUrl: ardugarden,
    tags: ["Hardware"],
    radius: radius,
    links: []
  },
  {
    title: "Starting a web development journey using Google Docs.",
    excerpt: "How cloud services makes programming to solve your issues feel either extremely complex, or extremely weird. I needed a solution to have a webpage connected to a google spreadsheet, since that's how the people I was working with knew how to access data, so I came up with this spreadsheet that implemented a point-and-click interface to choose items from a menu and registering the order. This Frankestein was made with JS libraries of Google Drive, Macros and good old Excel. Watching it actually be useful could've given anyone the chills.",
    date: "2016-03-05",
    imageUrl: gdrivepos,
    tags: ["WebDev", "Programming"],
    radius: radius,
    links: []
  },
  {
    title: "ArduPlanter",
    excerpt: "This tiny box lasted a good couple of years with nothing but a solar power and the will to keep giving information even after most of my plants had died. Made with an ArduinoNano at heart, it would send RF signals to the ESP base to track my outside Temp&Humidity and my plant moisture sensors. The ones I had bought broke, but I could reuse their voltage comparators with some graphite rods harvested from an art shop.",
    date: "2020-03-05",
    imageUrl: arduplanter,
    tags: ["Hardware", "Automation"],
    radius: radius,
    links: []
  },
  {
    title: "La Liga",
    excerpt: "This is my published site with the biggest backend probably. Full featured with an e-shop, it also includes a boardgame event handler software to help you manage the tables and send the appropriate invitations to the guests. A QR code is generated which can be scanned at the event to recover the updated information about that player's table and ticket purchasing history.",
    date: "2020-03-05",
    imageUrl: laliga,
    tags: ["WebDev", "Boardgames"],
    radius: radius,
    links: [
      {
        url: 'https://laliga.com.py',
        text: 'La Liga Web'
      }

    ]
  }
];