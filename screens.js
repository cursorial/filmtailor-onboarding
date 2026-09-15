/* ============================================================
   FILMTAILOR · deck onboarding screens
   ------------------------------------------------------------
   THE PRODUCT: FilmTailor's pitch deck builder. It turns a
   feature film into a deck, then re-cuts that deck for every
   room it gets pitched in.

   PRICING sits inside FilmTailor's existing ladder rather than
   inventing one: Free Forever (1 project), Solo $19.99 (3
   projects, "Most popular"), Team $49.99 (5 seats), Pro $99.99.
   The deck feature's recurring parts are the upgrade: every
   room version, comps alerts, more projects. Free keeps one
   deck, one version, and export, which matches the site's own
   "export to every format" on the free tier.

   THE TRAP: a deck generator is a one-time-use product. You
   make a deck for your script and leave. Three structural
   answers, each visible in the flow:
     · ONE FILM, MANY ROOMS. A financier, a streamer, a producer
       and an actor each read a different slide first, so the
       "who's seeing this" question is multi-select and every
       room gets its own version.
     · THE SLATE. Filmmakers always have more than one project
       in development. Home is the slate, never a single deck.
     · COMPS GO STALE. New films sell every week, so the one
       notification is "a film like yours just sold".

   THE MOMENT: "Give me your logline." Every writer has one and
   most are missing something. The next screen reads it against
   the five things an executive looks for and names the gap.
   Then the comps table does the business work writers can't
   do themselves, with reported figures and the median return.

   COPY RULES: identical to Yarn, enforced by lint.js.
     · one workhorse subtitle, repeated verbatim
     · every question is dialogue in first person
     · stats sit on top of an admission
     · options carry identity labels
     · the CTA is the user's own commitment
   BANNED: the one-two punch, passive and agentless voice,
   personified abstractions (decks, scripts and treatments
   don't give, prove or sell anything), antithesis, rhetorical
   lists of three, quotable one-liners, superlatives as
   emphasis, magic adverbs, vague verbs, em dashes, "land".
   ============================================================ */

const SUB = "I'll use this to build your deck.";

/* reported production budgets and worldwide grosses, $M, rounded */
const COMPS = {
  horror:  [ {v:"getout",t:"Get Out",y:2017,b:4.5,g:255}, {v:"quietplace",t:"A Quiet Place",y:2018,b:17,g:341},
             {v:"hereditary",t:"Hereditary",y:2018,b:10,g:82}, {v:"talktome",t:"Talk to Me",y:2023,b:4.5,g:92},
             {v:"barbarian",t:"Barbarian",y:2022,b:4.5,g:45} ],
  thriller:[ {v:"searching",t:"Searching",y:2018,b:0.9,g:75}, {v:"nightcrawler",t:"Nightcrawler",y:2014,b:8.5,g:50},
             {v:"gonegirl",t:"Gone Girl",y:2014,b:61,g:369}, {v:"prisoners",t:"Prisoners",y:2013,b:46,g:122},
             {v:"knivesout",t:"Knives Out",y:2019,b:40,g:312} ],
  drama:   [ {v:"moonlight",t:"Moonlight",y:2016,b:1.5,g:65}, {v:"whiplash",t:"Whiplash",y:2014,b:3.3,g:49},
             {v:"manchester",t:"Manchester by the Sea",y:2016,b:8.5,g:79}, {v:"ladybird",t:"Lady Bird",y:2017,b:10,g:79},
             {v:"pastlives",t:"Past Lives",y:2023,b:12,g:42} ],
  comedy:  [ {v:"fargo",t:"Fargo",y:1996,b:7,g:61}, {v:"littlemiss",t:"Little Miss Sunshine",y:2006,b:8,g:101},
             {v:"juno",t:"Juno",y:2007,b:7.5,g:232}, {v:"knivesout",t:"Knives Out",y:2019,b:40,g:312},
             {v:"fivehundred",t:"(500) Days of Summer",y:2009,b:7.5,g:61} ],
  scifi:   [ {v:"eeaao",t:"Everything Everywhere All at Once",y:2022,b:14,g:143}, {v:"exmachina",t:"Ex Machina",y:2014,b:15,g:37},
             {v:"district9",t:"District 9",y:2009,b:30,g:211}, {v:"arrival",t:"Arrival",y:2016,b:47,g:203} ],
  romance: [ {v:"pastlives",t:"Past Lives",y:2023,b:12,g:42}, {v:"fivehundred",t:"(500) Days of Summer",y:2009,b:7.5,g:61},
             {v:"crazyrich",t:"Crazy Rich Asians",y:2018,b:30,g:239}, {v:"silverlinings",t:"Silver Linings Playbook",y:2012,b:21,g:236} ],
  action:  [ {v:"johnwick",t:"John Wick",y:2014,b:20,g:86}, {v:"nobody",t:"Nobody",y:2021,b:16,g:57},
             {v:"babydriver",t:"Baby Driver",y:2017,b:34,g:227}, {v:"upgrade",t:"Upgrade",y:2018,b:5,g:17} ]
};

/* the finished walkthrough that drives the filmstrip thumbnails */
const DEMO = {
  stage:"polished", genre:"comedy", budget:"low",
  rooms:["financiers","producers","talent"], heard:["similar","budget"],
  title:"Clean Money",
  logline:"When a small-town dentist wins the lottery the same week her husband is charged with fraud, she has to hide the money from the police, the press and her own children.",
  comps:["fargo","littlemiss","juno"], team:"solo",
  hardest:["comps","look"], want:["money","attach"], commit:"evening"
};

/* ============================================================ */
const SCREENS = [

/* ---------------------------------------------------- OPENING */
{ id:"splash", kind:"splash", act:0, chrome:false, name:"Splash" },

{ id:"hero", kind:"hero", act:0, chrome:false, name:"Welcome",
  h1:"A pitch deck for<br>your feature film",
  lede:"Give me your logline and I'll build the deck.",
  cta:"Get Started", subcta:"Already have an account? <b>Sign In</b>" },

{ id:"intro", kind:"coachOnly", act:0, chrome:false, name:"The promise",
  coach:"Three minutes of questions, then I'll build your deck.",
  cta:"Continue" },

/* ---------------------------------------------------- ACT I: THE FILM */
{ id:"stage", kind:"select", act:1, key:"stage", name:"Where it is",
  coach:"Where is the film right now?", lede:SUB,
  opts:[
    {v:"idea",      label:"An idea", sub:"No pages yet"},
    {v:"treatment", label:"An outline or treatment", sub:"The story is worked out"},
    {v:"draft",     label:"A first draft", sub:"It exists and it's rough"},
    {v:"polished",  label:"A polished script", sub:"Ready for people to read"},
    {v:"post",      label:"Shot and in post", sub:"The footage exists"},
    {v:"finished",  label:"A finished film", sub:"Looking for distribution"}
  ] },

{ id:"stagereflect", kind:"reflectVar", act:1, varKey:"stage", name:"What the deck does",
  variants:{
    idea:{h1:"At the idea stage, you're selling yourself as much as the film.",
      body:"I'll lead with the logline and the tone and keep the budget to one line."},
    treatment:{h1:"With a treatment, you can show the whole arc.",
      body:"I'll turn it into a three-act slide an executive can read in under a minute."},
    draft:{h1:"A first draft is enough to pitch.",
      body:"I'll pull your strongest scene into the deck so people ask for the rest."},
    polished:{big:"89%", bigUnit:"of scripts sent cold go unread",
      h1:"Now the job is getting someone to open it.",
      body:"I'll build every slide around that one goal."},
    post:{h1:"You've got footage to show.",
      body:"I'll build every page around frames from what you've shot."},
    finished:{h1:"You need a sales deck now.",
      body:"I'll put your festival plan and your audience on the first three slides."}
  } },

{ id:"genre", kind:"select", act:1, key:"genre", name:"Genre",
  coach:"What kind of film is it?", lede:SUB,
  opts:[
    {v:"horror",   label:"Horror", sub:"Dread, and something in the dark", phrase:"a horror film", noun:"horror",
     kw:"haunted ghost demon possessed killer monster curse creature blood scream"},
    {v:"thriller", label:"Thriller", sub:"Tension, crime, a clock running", phrase:"a thriller", noun:"thriller",
     kw:"murder conspiracy kidnap heist fraud police detective assassin hunt chase missing kill"},
    {v:"drama",    label:"Drama", sub:"People, choices, consequences", phrase:"a drama", noun:"drama",
     kw:"grief estranged dying reconcile illness addiction mourning custody divorce"},
    {v:"comedy",   label:"Comedy", sub:"Including dark comedy", phrase:"a comedy", noun:"comedy",
     kw:"hapless bumbling inept disastrous hilarious ridiculous chaos misfit awkward accidentally"},
    {v:"scifi",    label:"Science fiction", sub:"A world with one rule changed", phrase:"a science fiction film", noun:"sci-fi",
     kw:"alien robot android clone simulation future planet space colony"},
    {v:"romance",  label:"Romance", sub:"Two people and what's in the way", phrase:"a romance", noun:"romance",
     kw:"love affair heart wedding romance date ex"},
    {v:"action",   label:"Action", sub:"Set pieces and momentum", phrase:"an action film", noun:"action",
     kw:"mission revenge cartel rescue bomb soldier army war"}
  ] },

{ id:"budget", kind:"select", act:1, key:"budget", name:"Budget",
  coach:"What will it cost to make?", lede:SUB,
  opts:[
    {v:"micro",   label:"Under $1M", tag:"Micro", phrase:"under $1M"},
    {v:"low",     label:"$1M to $5M", tag:"Low", phrase:"$1M to $5M"},
    {v:"mid",     label:"$5M to $20M", tag:"Mid", phrase:"$5M to $20M"},
    {v:"high",    label:"Over $20M", tag:"Studio", phrase:"over $20M"},
    {v:"unknown", label:"No idea yet", tag:"Open", phrase:"a budget to be set"}
  ] },

{ id:"budgetreflect", kind:"reflectVar", act:1, varKey:"budget", name:"Budget, answered",
  variants:{
    micro:{big:"62%", bigUnit:"of the first features we see are under $1M",
      h1:"You're asking a financier to risk very little.",
      body:"I'll put the budget on slide two so they see how small the risk is."},
    low:{big:"41%", bigUnit:"of FilmTailor decks are budgeted in this range",
      h1:"Most independent filmmakers work in this range.",
      body:"I'll pick comps that made several times this budget back."},
    mid:{h1:"At this budget, you have to prove there's an audience.",
      body:"I'll build a slide on who buys a ticket before the budget appears."},
    high:{h1:"Over $20M, the pitch is about who's attached.",
      body:"I'll put talent and producers ahead of the story."},
    unknown:{big:"70%", bigUnit:"of writers we see can't name their budget",
      h1:"Most writers can't name theirs either.",
      body:"I'll estimate a range from your genre, your cast size and your locations."}
  } },

/* ---------------------------------------------------- ACT II: THE PITCH */
{ id:"rooms", kind:"select", act:2, key:"rooms", multi:true, name:"The rooms",
  coach:"Who's going to see this deck?",
  lede:"Pick as many as you like.",
  opts:[
    {v:"financiers", label:"Financiers and investors", sub:"People putting money in", room:"financiers"},
    {v:"streamers",  label:"Streamers and distributors", sub:"People who'll buy it", room:"streamers"},
    {v:"producers",  label:"Producers and production companies", sub:"People who get films made", room:"producers"},
    {v:"talent",     label:"Actors or a director", sub:"People you want attached", room:"talent"},
    {v:"labs",       label:"Labs, grants and fellowships", sub:"Applications with a deadline", room:"lab readers"},
    {v:"crowd",      label:"Crowdfunding backers", sub:"The public, backing it early", room:"backers"}
  ] },

{ id:"roomsreflect", kind:"reflectVar", act:2, varKey:"roomMode", name:"One film, many decks",
  variants:{
    many:{eyebrow:"{roomCount} rooms", h1:"One film, {roomCount} decks.",
      body:"I'll make a version for {roomList}, each with a different first slide."},
    one:{eyebrow:"Where you'll start", h1:"I'll build it for {roomOne}.",
      body:"Add another room later and I'll make a version for it."}
  } },

{ id:"heard", kind:"select", act:2, key:"heard", multi:true, style:"quote", name:"What they've said",
  coach:"Has anyone said this about your project?",
  lede:"Select all that apply.",
  opts:[
    {v:"similar",   qt:"It sounds like something that already exists.", diag:"Comps framed wrong"},
    {v:"whofor",    qt:"Who's the audience for this?",                  diag:"No audience case"},
    {v:"budget",    qt:"What's it going to cost?",                       diag:"No numbers"},
    {v:"attached",  qt:"Who's attached?",                                diag:"No package"},
    {v:"later",     qt:"I'll read it and get back to you.",              diag:"No reason to hurry"},
    {v:"tone",      qt:"I don't get the tone.",                          diag:"No visual reference"},
    {v:"none",      qt:"Nobody's seen it yet.",                          diag:"This is the first time"}
  ] },

{ id:"heardreflect", kind:"reflectVar", act:2, varKey:"heardPrimary", name:"Heard, answered",
  stackKey:"heard", stackTitle:"Here's the slide that answers each one.",
  variants:{
    similar:{quote:"“It sounds like something that already exists.”",
      big:"58%", bigUnit:"of FilmTailor users heard this before they joined",
      h1:"You've framed your comps as a warning.",
      body:"I'll turn your comparisons into proof there's an audience that already paid.",
      short:"Your comps become proof of an audience."},
    whofor:{quote:"“Who's the audience for this?”", h1:"No audience case.",
      body:"I'll build a slide that names who buys a ticket, with the films they already paid to see.",
      short:"A slide naming who buys a ticket."},
    budget:{quote:"“What's it going to cost?”",
      big:"83%", bigUnit:"of FilmTailor users hear this in the first meeting",
      h1:"No numbers.",
      body:"I'll put a budget range and a financing plan on one slide, even if every figure is an estimate.",
      short:"A budget range and a financing plan on one slide."},
    attached:{quote:"“Who's attached?”", h1:"No package.",
      body:"I'll build a wish-list slide of actors who work at your budget.",
      short:"A wish list of actors who work at your budget."},
    later:{quote:"“I'll read it and get back to you.”",
      big:"2 in 3", bigUnit:"readers who say that never open the script",
      h1:"They had no reason to hurry.",
      body:"I'll add a why-now slide that ties the film to something happening this year.",
      short:"A why-now slide tied to this year."},
    tone:{quote:"“I don't get the tone.”", h1:"No visual reference.",
      body:"I'll build a tone page from films they already know.",
      short:"A tone page built from films they know."},
    none:{h1:"You're starting clean.",
      body:"I'll build the deck to answer the four questions people ask first: the audience, the budget, the comps and who's attached.",
      short:"I'll answer the four questions people ask first."}
  } },

/* ---------------------------------------------------- the logline read */
{ id:"logline", kind:"text", act:2, name:"Your logline",
  coach:"Give me your title and your logline.",
  lede:"I'll read it the way a development executive would.",
  titleLabel:"Working title", loglineLabel:"Logline",
  fieldNote:"Replace the example with yours, or keep it to see how I read.",
  countOk:"words", countLong:"words, aim for 35",
  cta:"Read my logline" },

{ id:"loglinefeedback", kind:"logline", act:2, name:"Your read",
  eyebrow:"Your logline",
  h1:"Here's what I found in it.",
  elements:["Lead","Goal","Stakes","Hook","Genre"],
  tileWords:"words", tileHits:"of five elements", tileRead:"seconds to read",
  cta:"Continue" },

{ id:"loglinereflect", kind:"reflectVar", act:2, varKey:"loglineVerdict", name:"The note",
  variants:{
    long:{eyebrow:"The main note", h1:"It runs to {words} words.",
      body:"Cut it under 35 so an executive reads to the end."},
    lead:{eyebrow:"The main note", h1:"I can't see who it's about.",
      body:"Put one adjective and one job in front of your lead, like “a disgraced surgeon”."},
    goal:{eyebrow:"The main note", h1:"Your lead doesn't want anything yet.",
      body:"Give them one thing they're chasing, like “has to hide” or “sets out to find”."},
    stakes:{eyebrow:"The main note", h1:"Nothing is at risk.",
      body:"Add what happens if they fail, in the same sentence as what they want."},
    genre:{eyebrow:"The main note", h1:"I can't tell it's {genrePhrase}.",
      body:"Add one word that tells the reader it's {genrePhrase}, like “{genreKw1}” or “{genreKw2}”."},
    hook:{eyebrow:"The main note", h1:"It reads like a lot of films.",
      body:"Name the one thing about the situation that shouldn't be true, like a dentist winning the lottery the week her husband is charged with fraud."},
    good:{eyebrow:"The main note", h1:"An executive would read that one to the end.",
      body:"Next I'll find the films they'll compare it to."}
  } },

{ id:"comps", kind:"select", act:2, key:"comps", multi:true, optsFrom:"comps", name:"Comps",
  coach:"Which films is yours closest to?",
  lede:"Pick the two or three it's closest to." },

{ id:"compsreflect", kind:"compsTable", act:2, name:"Your comps",
  eyebrow:"Your comps",
  big:"{compsMultiple}x", bigUnit:"median return on the films you picked",
  colFilm:"Film", colBudget:"Budget", colGross:"Box office", colX:"Return",
  body:"I'll put that number on the comps slide, beside the posters.",
  medianNote:"I use the median, so one breakout hit can't skew the number." },

/* ---------------------------------------------------- ACT III: THE PACKAGE */
{ id:"team", kind:"select", act:3, key:"team", name:"Who's attached",
  coach:"Who's attached so far?", lede:SUB,
  opts:[
    {v:"solo",     label:"Just me", sub:"Writer, maybe director"},
    {v:"producer", label:"A producer", sub:"Someone who's made a film before"},
    {v:"director", label:"A director who isn't me", sub:"Attached or interested"},
    {v:"cast",     label:"An actor", sub:"Attached, or has read it"},
    {v:"company",  label:"A production company", sub:"Development or financing"}
  ] },

{ id:"teamreflect", kind:"reflectVar", act:3, varKey:"team", name:"The package",
  variants:{
    solo:{big:"3x", bigUnit:"more second meetings for decks with a producer on them",
      h1:"Most first decks have only the writer on them.",
      body:"I'll add a slide naming the kind of producer you're looking for."},
    producer:{h1:"With a producer attached, more people will take the meeting.",
      body:"I'll put their credits on slide three."},
    director:{h1:"People will judge the tone by your director's past films.",
      body:"I'll build the tone page around their previous work."},
    cast:{big:"4x", bigUnit:"more replies for decks with an actor attached",
      h1:"An actor is the first thing a financier asks about.",
      body:"I'll put them on the title slide."},
    company:{h1:"A production company means someone has already said yes.",
      body:"I'll lead with their logo and their slate."}
  } },

{ id:"hardest", kind:"select", act:3, key:"hardest", multi:true, name:"What you'd put off",
  coach:"Which part of the deck would you put off the longest?",
  lede:"Select all that apply.",
  opts:[
    {v:"comps",    label:"Comps and box office", sub:"I don't know the numbers"},
    {v:"budget",   label:"The budget", sub:"I've never priced a film"},
    {v:"look",     label:"The visuals", sub:"I'm a writer, not a designer"},
    {v:"logline",  label:"The logline", sub:"I can't get it short"},
    {v:"order",    label:"Knowing what goes where", sub:"Which slide comes first"},
    {v:"business", label:"The business case", sub:"Why anyone should pay for it"}
  ] },

{ id:"hardestreflect", kind:"reflectVar", act:3, varKey:"hardestPrimary", name:"Handled",
  stackKey:"hardest", stackTitle:"Here's how I'll handle each one.",
  variants:{
    comps:{quote:"Comps and box office", h1:"I'll do the numbers.",
      body:"I'll pull the reported budget and box office for every comp you pick.",
      short:"I'll pull budgets and box office for every comp."},
    budget:{quote:"The budget", h1:"I'll give you a range.",
      body:"I'll estimate a budget from your genre, your cast size and your locations.",
      short:"A range from your genre, cast and locations."},
    look:{quote:"The visuals", h1:"You won't design anything.",
      body:"I'll build the tone page and the layout from films in your genre.",
      short:"I'll build the look from films in your genre."},
    logline:{quote:"The logline", h1:"You've already given me a draft.",
      body:"I'll keep the version you wrote and give you three tighter cuts of it.",
      short:"Three tighter cuts of the one you wrote."},
    order:{quote:"Knowing what goes where", h1:"There's a standard order.",
      body:"I'll arrange the twelve slides in the order an executive reads them.",
      short:"Twelve slides, in reading order."},
    business:{quote:"The business case", h1:"The business case is one slide.",
      body:"I'll build it from your budget, your comps and your audience.",
      short:"One slide, from your budget, comps and audience."}
  } },

{ id:"want", kind:"select", act:3, key:"want", multi:true, name:"What it has to do",
  coach:"What do you need this deck to do?",
  lede:"Select all that apply.",
  opts:[
    {v:"meeting", label:"Get me in the room", sub:"A meeting with someone who can say yes"},
    {v:"money",   label:"Raise the money", sub:"Some or all of the budget"},
    {v:"attach",  label:"Attach an actor or director", sub:"The name everyone else asks about"},
    {v:"lab",     label:"Get into a lab or fellowship", sub:"A deadline I'm working toward"},
    {v:"sell",    label:"Sell the film", sub:"It's made and it needs a home"},
    {v:"first",   label:"Get my first feature made", sub:"I've been at this a while"}
  ] },

{ id:"wantreflect", kind:"reflectVar", act:3, varKey:"wantPrimary", name:"Aimed",
  stackKey:"want", stackTitle:"Here's how I'll aim the deck.",
  variants:{
    meeting:{quote:"“Get me in the room.”", h1:"People decide on a meeting by slide three.",
      body:"I'll put the logline, the comps and the why-now on slides one to three.",
      short:"Logline, comps and why-now on the first three slides."},
    money:{quote:"“Raise the money.”", h1:"Financiers read the budget before the story.",
      body:"I'll put the budget, the financing plan and the comps in the first half.",
      short:"Budget and comps in the first half."},
    attach:{quote:"“Attach an actor or director.”", h1:"Actors read for the part.",
      body:"I'll build a character page for the role you most want to cast.",
      short:"A character page for the role you're casting."},
    lab:{quote:"“Get into a lab or fellowship.”", h1:"Lab readers are looking for a voice.",
      body:"I'll add a director's statement page in your own words.",
      short:"A director's statement in your words."},
    sell:{quote:"“Sell the film.”", h1:"Buyers want to see the audience.",
      body:"I'll build a sales deck around your festival plan and your audience.",
      short:"A sales deck around your festivals and audience."},
    first:{quote:"“Get my first feature made.”", h1:"On a first feature, people invest in the filmmaker.",
      body:"I'll add a page on your previous work, including shorts.",
      short:"A page on your previous work."}
  } },

{ id:"social", kind:"social", act:3, name:"Social proof",
  rating:"4.8", ratingSub:"8K+ App Ratings",
  h1:"1 in 3 users take a meeting<br>off their first deck",
  users:"210K Decks Built",
  testimonial:{ name:"Dani O.", role:"Writer-director · first feature",
    body:"I'd been sending the script with a two-line email for a year and nobody opened it. The comps slide got the first reply, and the producer who called me back quoted the Searching numbers at me like I'd found them myself." } },

{ id:"commit", kind:"select", act:3, key:"commit", name:"Commitment", ctaLabel:"I'm in",
  coach:"How much time can you give it this week?",
  lede:"Pick what you could do in a busy week.",
  opts:[
    {v:"hour",    label:"An hour", tag:"Quick"},
    {v:"evening", label:"An evening", tag:"Solid", rec:true},
    {v:"weekend", label:"A weekend", tag:"Full"},
    {v:"asap",    label:"I need it tomorrow", tag:"Rush"}
  ] },

{ id:"commitmath", kind:"reflect", act:3, name:"The math",
  big:"{readyBy}", bigUnit:"you'll have it ready to send",
  h1:"{versionsLine}",
  body:"You write, and I'll do the layout and the numbers." },

/* ---------------------------------------------------- ACT IV: YOUR DECK */
{ id:"trust", kind:"reflect", act:4, art:"privacy", name:"Thank you",
  h1:"Thank you for trusting me",
  body:"Now let's build your deck…",
  privacy:"Nobody sees your logline or your deck unless you send them." },

{ id:"notifs", kind:"permission", act:4, name:"Notifications",
  coach:"I'll tell you when a film like yours sells.",
  lede:"You'll hear about new comps the week they sell.",
  art:"bell",
  alert:{title:"“FilmTailor” Would Like to Send You Notifications",
         body:"Notifications may include alerts, sounds and icon badges.",
         no:"Don't Allow", yes:"Allow"},
  cta:"Keep my comps current", subcta2:"Not now" },

{ id:"alldone", kind:"reflect", act:4, art:"done", name:"All done",
  eyebrow:"All done!",
  h1:"Time to build your deck",
  body:"I'll build it from your answers and your logline.",
  cta:"Continue" },

{ id:"loading", kind:"loading", act:4, chrome:false, name:"Building the deck",
  h1:"I'm building your deck",
  steps:["Reading your logline","Pulling box office for your comps","Ordering the slides","Making a version for each room"],
  listTitle:"Built from what you told me",
  list:["A title slide for {titleShown}","Comps that made {compsMultiple} times their budget","A budget slide for {budgetPhrase}","{versionsCount} for {roomList}"],
  social:"Get ready to join the <b>9,000 filmmakers</b> building {genreNoun} decks on FilmTailor this month." },

{ id:"structure", kind:"phases", act:4, name:"The deck",
  h1:"Twelve slides,<br>in three parts",
  phases:[
    {n:"1", t:"The hook", d:"Slides 1–4", b:"Title, logline, why now and tone."},
    {n:"2", t:"The story", d:"Slides 5–8", b:"Synopsis, characters, the world and your statement."},
    {n:"3", t:"The business", d:"Slides 9–12", b:"Comps, audience, budget and team, in a different order for each room."}
  ],
  cta:"Continue" },

{ id:"projection", kind:"projection", act:4, name:"Ready to pitch",
  coach:"I scored your pitch on five things.",
  labelNow:"Today", labelAfter:"This week", headLeft:"Your pitch", headRight:"today → this week",
  caption:"People reply to decks scoring over 80 twice as often.",
  cta:"Continue" },

{ id:"reveal", kind:"deck", act:4, name:"Your deck",
  h1:"Your deck is ready",
  tradition:"In the tradition of {comp1} and {comp2}",
  versionsLabel:"Versions",
  slides:["Title","Logline","Why now","Tone","Synopsis","Characters","World","Statement","Comps","Audience","Budget","Team"],
  cta:"Open my deck" },

{ id:"anchor", kind:"reflect", act:4, name:"What a deck costs",
  big:"$800", bigUnit:"to $3,000 for a designed deck from a freelancer",
  h1:"A designer charges by the deck.",
  body:"Solo is $19.99 a month for every version of every deck on up to three projects." },

{ id:"paywall", kind:"paywall", act:4, key:"plan", name:"Pricing",
  eyebrow:"Pick a plan",
  h1:"Start free. Upgrade when you need more power.",
  plans:[
    {v:"solo", label:"Solo", price:"$19.99", per:"/month", rec:"Most popular",
     sub:"Every room version, comps alerts and up to three projects."},
    {v:"free", label:"Free forever", price:"$0", per:"",
     sub:"One project, one version, and export in every format."}
  ],
  fine:"Producers with a crew: Team is $49.99 a month with five seats.",
  ctaByPlan:{ solo:"Start with Solo", free:"Continue free" } },

{ id:"home", kind:"home", act:4, chrome:false, name:"Your slate",
  slateLabel:"Your slate", readyLabel:"pitch-ready", nextLabel:"Next", goLabel:"Start",
  newLabel:"New project",
  nextActions:{ logline:"Cut your logline under 35 words", comps:"Add a third comp",
    market:"Name who buys a ticket", look:"Pick three films for the tone page",
    team:"Add a producer to the team slide" },
  tabs:["Slate","Decks","Comps","You"] }

];
