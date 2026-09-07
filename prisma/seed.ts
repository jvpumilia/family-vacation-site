import { PrismaClient } from "@prisma/client";
import { lodgingQualifies, scoreLodging } from "../src/lib/scoring";

const prisma = new PrismaClient();

type TD = Record<string, number>;

const destinations = [
  {
    slug: "gatlinburg-pigeon-forge",
    name: "Gatlinburg / Pigeon Forge / Sevierville, TN",
    shortName: "Gatlinburg / PF",
    state: "TN",
    lat: 35.788,
    lng: -83.554,
    status: "ballot_eligible",
    lodgingFeasibility: 25,
    onSiteAmenities: 10,
    travelBurden: 12,
    kidActivities: 15,
    natureNp: 14,
    overflow: 5,
    juneCost: 8,
    totalScore: 89,
    airports: ["TYS"],
    seaPattern: "SEA→BNA nonstop + ~3.5h drive (no SEA–TYS nonstop)",
    summary:
      "Deepest US inventory of 8–12 BR cabins with indoor pools, game rooms, and theaters. Great Smoky Mountains NP minutes away. Worst travel day for Seattle family.",
    callout: null,
    travelDifficulty: { gig_harbor_wa: 8, florida: 6, nashville: 2, rockford_il: 4, janesville_wi: 4 } as TD,
    sortOrder: 1,
    disqualified: false,
  },
  {
    slug: "estes-park-ymca",
    name: "Estes Park, CO — YMCA of the Rockies",
    shortName: "Estes / YMCA",
    state: "CO",
    lat: 40.377,
    lng: -105.522,
    status: "ballot_eligible",
    lodgingFeasibility: 17,
    onSiteAmenities: 9,
    travelBurden: 18,
    kidActivities: 13,
    natureNp: 15,
    overflow: 5,
    juneCost: 8,
    totalScore: 85,
    airports: ["DEN"],
    seaPattern: "SEA→DEN nonstop ~2h45 + 1h45 drive",
    summary:
      "8-BR retreat cabin on campus bordering Rocky Mountain NP. Best overflow (lodge rooms 200 yards away). Availability risk at 9 months — call this week.",
    callout: "CALL 800-777-9622 this week for June 2027 8BR cabin availability",
    travelDifficulty: { gig_harbor_wa: 3, florida: 3, nashville: 3, rockford_il: 3, janesville_wi: 3 } as TD,
    sortOrder: 2,
    disqualified: false,
  },
  {
    slug: "park-city-heber",
    name: "Park City / Heber Valley, UT",
    shortName: "Park City / Heber",
    state: "UT",
    lat: 40.646,
    lng: -111.498,
    status: "ballot_eligible",
    lodgingFeasibility: 20,
    onSiteAmenities: 7,
    travelBurden: 19,
    kidActivities: 13,
    natureNp: 11,
    overflow: 5,
    juneCost: 9,
    totalScore: 84,
    airports: ["SLC"],
    seaPattern: "SEA→SLC nonstop ~2h05 + 35–50 min drive — shortest SEA door-to-door",
    summary:
      "Best answer to Seattle travel burden. June is shoulder season (dry, 75–85°F). No NP adjacency — forest/rivers/Timpanogos Cave. Thinner luxury inventory than Smokies.",
    callout: null,
    travelDifficulty: { gig_harbor_wa: 2, florida: 5, nashville: 3, rockford_il: 3, janesville_wi: 3 } as TD,
    sortOrder: 3,
    disqualified: false,
  },
  {
    slug: "orlando-reunion",
    name: "Orlando — Reunion / ChampionsGate, FL",
    shortName: "Orlando Reunion/CG",
    state: "FL",
    lat: 28.262,
    lng: -81.647,
    status: "ballot_eligible",
    lodgingFeasibility: 25,
    onSiteAmenities: 10,
    travelBurden: 19,
    kidActivities: 15,
    natureNp: 4,
    overflow: 5,
    juneCost: 5,
    totalScore: 83,
    airports: ["MCO"],
    seaPattern: "SEA→MCO nonstop; MCO nonstop from all five origins",
    summary:
      "Best lodging product: 8–12 BR villas with private pools, game rooms, theaters, resort water parks. Weak nature. June heat/storms. Theme-park ticket cost is the real budget.",
    callout: "Ask Florida family how they feel about vacationing near home",
    travelDifficulty: { gig_harbor_wa: 3, florida: 1, nashville: 2, rockford_il: 2, janesville_wi: 2 } as TD,
    sortOrder: 4,
    disqualified: false,
  },
  {
    slug: "branson",
    name: "Branson / Table Rock Lake, MO",
    shortName: "Branson",
    state: "MO",
    lat: 36.644,
    lng: -93.218,
    status: "ballot_eligible",
    lodgingFeasibility: 20,
    onSiteAmenities: 8,
    travelBurden: 10,
    kidActivities: 13,
    natureNp: 8,
    overflow: 5,
    juneCost: 9,
    totalScore: 73,
    airports: ["SGF"],
    seaPattern: "Poor air access — connections only from SEA/FL/Nashville",
    summary:
      "Good lodge inventory + Silver Dollar City. Ranks 5th mainly due to air access. Included so we can see why it lost.",
    callout: null,
    travelDifficulty: { gig_harbor_wa: 9, florida: 7, nashville: 5, rockford_il: 4, janesville_wi: 4 } as TD,
    sortOrder: 5,
    disqualified: false,
  },
  {
    slug: "blue-ridge-ga",
    name: "Blue Ridge, GA",
    shortName: "Blue Ridge GA",
    state: "GA",
    lat: 34.864,
    lng: -84.324,
    status: "ballot_eligible",
    lodgingFeasibility: 15,
    onSiteAmenities: 7,
    travelBurden: 15,
    kidActivities: 10,
    natureNp: 11,
    overflow: 5,
    juneCost: 8,
    totalScore: 71,
    airports: ["ATL"],
    seaPattern: "SEA→ATL nonstop + ~1h45 drive",
    summary:
      "Travel beats Gatlinburg, but thin true 7BR inventory. Flagship sleeps exactly 14 — zero margin. Gate risk if booking falls through.",
    callout: "Gate risk: almost no second comparable 7BR option",
    travelDifficulty: { gig_harbor_wa: 5, florida: 4, nashville: 3, rockford_il: 4, janesville_wi: 4 } as TD,
    sortOrder: 6,
    disqualified: false,
  },
  {
    slug: "hilton-head",
    name: "Hilton Head Island, SC",
    shortName: "Hilton Head",
    state: "SC",
    lat: 32.216,
    lng: -80.753,
    status: "research",
    lodgingFeasibility: 18,
    onSiteAmenities: 8,
    travelBurden: 14,
    kidActivities: 12,
    natureNp: 8,
    overflow: 5,
    juneCost: 7,
    totalScore: 72,
    airports: ["CHS", "SAV"],
    seaPattern: "SEA→CHS nonstop possible + drive",
    summary: "Beach + bike paths; large homes common. Research destination — not on Claude top-6 ballot.",
    callout: null,
    travelDifficulty: { gig_harbor_wa: 6, florida: 4, nashville: 4, rockford_il: 5, janesville_wi: 5 } as TD,
    sortOrder: 10,
    disqualified: false,
  },
  {
    slug: "destin-30a",
    name: "Destin / 30A, FL",
    shortName: "Destin / 30A",
    state: "FL",
    lat: 30.393,
    lng: -86.496,
    status: "research",
    lodgingFeasibility: 14,
    onSiteAmenities: 8,
    travelBurden: 12,
    kidActivities: 13,
    natureNp: 7,
    overflow: 4,
    juneCost: 6,
    totalScore: 64,
    airports: ["VPS", "ECP"],
    seaPattern: "No SEA nonstop to VPS/ECP — connections",
    summary: "Beach for all ages. Claude noted thin 7BR at sane June price; puts FL family near home.",
    callout: null,
    travelDifficulty: { gig_harbor_wa: 8, florida: 2, nashville: 4, rockford_il: 5, janesville_wi: 5 } as TD,
    sortOrder: 11,
    disqualified: false,
  },
  {
    slug: "wisconsin-dells",
    name: "Wisconsin Dells, WI",
    shortName: "WI Dells",
    state: "WI",
    lat: 43.627,
    lng: -89.771,
    status: "research",
    lodgingFeasibility: 14,
    onSiteAmenities: 10,
    travelBurden: 16,
    kidActivities: 14,
    natureNp: 5,
    overflow: 5,
    juneCost: 8,
    totalScore: 72,
    airports: ["MSN"],
    seaPattern: "SEA→MSN nonstop; Rockford/Janesville drive ~2h",
    summary: "Waterpark paradise; driveable for IL/WI. Thin true 7BR; not a nature destination. Wildcard if travel burden decides.",
    callout: null,
    travelDifficulty: { gig_harbor_wa: 4, florida: 6, nashville: 5, rockford_il: 1, janesville_wi: 1 } as TD,
    sortOrder: 12,
    disqualified: false,
  },
  {
    slug: "obx",
    name: "Outer Banks (Corolla / Duck), NC",
    shortName: "OBX",
    state: "NC",
    lat: 36.378,
    lng: -75.83,
    status: "research",
    lodgingFeasibility: 18,
    onSiteAmenities: 7,
    travelBurden: 11,
    kidActivities: 12,
    natureNp: 10,
    overflow: 5,
    juneCost: 7,
    totalScore: 70,
    airports: ["ORF"],
    seaPattern: "SEA connections to ORF + long drive",
    summary: "Large beach houses common. Long travel for Seattle toddlers.",
    callout: null,
    travelDifficulty: { gig_harbor_wa: 9, florida: 5, nashville: 5, rockford_il: 6, janesville_wi: 6 } as TD,
    sortOrder: 13,
    disqualified: false,
  },
  {
    slug: "zion",
    name: "Zion / St. George area, UT",
    shortName: "Zion",
    state: "UT",
    lat: 37.198,
    lng: -112.986,
    status: "research",
    lodgingFeasibility: 16,
    onSiteAmenities: 8,
    travelBurden: 15,
    kidActivities: 11,
    natureNp: 15,
    overflow: 4,
    juneCost: 7,
    totalScore: 76,
    airports: ["LAS", "SLC", "SGU"],
    seaPattern: "SEA→LAS or SLC nonstop + drive",
    summary: "Zion NP + growing 7BR pool/game-room homes in La Verkin/Orderville. June heat in desert.",
    callout: null,
    travelDifficulty: { gig_harbor_wa: 4, florida: 6, nashville: 5, rockford_il: 5, janesville_wi: 5 } as TD,
    sortOrder: 14,
    disqualified: false,
  },
  {
    slug: "san-diego",
    name: "San Diego / La Jolla, CA",
    shortName: "San Diego",
    state: "CA",
    lat: 32.832,
    lng: -117.271,
    status: "research",
    lodgingFeasibility: 12,
    onSiteAmenities: 7,
    travelBurden: 17,
    kidActivities: 14,
    natureNp: 8,
    overflow: 4,
    juneCost: 6,
    totalScore: 68,
    airports: ["SAN"],
    seaPattern: "SEA→SAN nonstops",
    summary: "Zoo, beaches, Legoland day trip. True 7BR homes scarce/pricey.",
    callout: null,
    travelDifficulty: { gig_harbor_wa: 3, florida: 6, nashville: 6, rockford_il: 6, janesville_wi: 6 } as TD,
    sortOrder: 15,
    disqualified: false,
  },
  {
    slug: "yellowstone",
    name: "Island Park / West Yellowstone, ID-MT",
    shortName: "Yellowstone",
    state: "ID",
    lat: 44.42,
    lng: -111.37,
    status: "research",
    lodgingFeasibility: 12,
    onSiteAmenities: 5,
    travelBurden: 14,
    kidActivities: 10,
    natureNp: 15,
    overflow: 4,
    juneCost: 6,
    totalScore: 66,
    airports: ["BZN"],
    seaPattern: "SEA→BZN nonstop possible; other origins harder",
    summary: "Nature crown jewel. Fewer pool/game mega-homes; toddlers tire on long park days.",
    callout: null,
    travelDifficulty: { gig_harbor_wa: 4, florida: 8, nashville: 7, rockford_il: 6, janesville_wi: 6 } as TD,
    sortOrder: 16,
    disqualified: false,
  },
];

type LodgingSeed = {
  dest: string;
  title: string;
  url: string;
  source: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  realBedroomsConfirmed: boolean;
  hasPool: boolean;
  hasGameRoom: boolean;
  hasTheater: boolean;
  parkingSpaces: number;
  status: string;
  finalized: boolean;
  /** Seed household key for submitter (≤2 finalized per user) */
  submitterKey?: string;
  zeroMargin?: boolean;
  notes?: string;
  lat?: number;
  lng?: number;
};

const lodgings: LodgingSeed[] = [
  {
    dest: "gatlinburg-pigeon-forge",
    title: "Bearfoot Lodge (8 BR collection example)",
    url: "https://www.largecabinrentals.com/find-a-large-cabin/8-bedroom-cabins",
    source: "manager",
    bedrooms: 8,
    bathrooms: 8,
    sleeps: 22,
    realBedroomsConfirmed: false,
    hasPool: true,
    hasGameRoom: true,
    hasTheater: true,
    parkingSpaces: 4,
    status: "scored",
    finalized: false,
    submitterKey: "demo",
    notes: "Large Cabin Rentals 8BR collection — verify specific unit + beds in writing",
    lat: 35.8,
    lng: -83.56,
  },
  {
    dest: "gatlinburg-pigeon-forge",
    title: "Grinning Bear Retreat (indoor pool + theater)",
    url: "https://www.cabinsofthesmokymountains.com/gatlinburg-pigeon-forge-cabin-rentals/8-20-bedroom",
    source: "manager",
    bedrooms: 8,
    bathrooms: 8,
    sleeps: 20,
    realBedroomsConfirmed: true,
    hasPool: true,
    hasGameRoom: true,
    hasTheater: true,
    parkingSpaces: 4,
    status: "scored",
    finalized: true,
    submitterKey: "demo",
    notes: "Cabins of the Smoky Mountains — named property; beds treated as verified in research",
    lat: 35.79,
    lng: -83.55,
  },
  {
    dest: "gatlinburg-pigeon-forge",
    title: "Hearthside indoor-pool cabins (8+ BR)",
    url: "https://www.hearthsidecabinrentals.com/cabins-indoor-pool",
    source: "manager",
    bedrooms: 8,
    bathrooms: 7,
    sleeps: 18,
    realBedroomsConfirmed: false,
    hasPool: true,
    hasGameRoom: true,
    hasTheater: false,
    parkingSpaces: 3,
    status: "scored",
    finalized: false,
    submitterKey: "demo",
    lat: 35.81,
    lng: -83.57,
  },
  {
    dest: "estes-park-ymca",
    title: "YMCA Rockies — 8-Bedroom Retreat Cabin",
    url: "https://www.ymcarockies.org/estes-park-center/groups/stay/8-bedroom-cabin",
    source: "manager",
    bedrooms: 8,
    bathrooms: 8.5,
    sleeps: 34,
    realBedroomsConfirmed: true,
    hasPool: true,
    hasGameRoom: false,
    hasTheater: false,
    parkingSpaces: 6,
    status: "scored",
    finalized: true,
    submitterKey: "demo",
    notes: "Primary target. Campus amenities cover kids. CALL for June 2027.",
    lat: 40.34,
    lng: -105.56,
  },
  {
    dest: "estes-park-ymca",
    title: "Panorama (VRBO 892191) — fallback",
    url: "https://www.vrbo.com/892191",
    source: "vrbo",
    bedrooms: 6,
    bathrooms: 5.5,
    sleeps: 14,
    realBedroomsConfirmed: false,
    hasPool: true,
    hasGameRoom: true,
    hasTheater: true,
    parkingSpaces: 3,
    status: "pending_score",
    finalized: false,
    submitterKey: "nashville",
    notes: "6 BR — FAILS 7BR gate; beds unconfirmed — stays off ballot",
    lat: 40.39,
    lng: -105.51,
  },
  {
    dest: "park-city-heber",
    title: "Silver Springs Lodge, Heber (10 BR)",
    url: "https://silverspringslodge.com",
    source: "manager",
    bedrooms: 10,
    bathrooms: 13,
    sleeps: 45,
    realBedroomsConfirmed: true,
    hasPool: true,
    hasGameRoom: true,
    hasTheater: true,
    parkingSpaces: 8,
    status: "scored",
    finalized: true,
    submitterKey: "nashville",
    notes: "Strongest single property in this market for our criteria",
    lat: 40.51,
    lng: -111.41,
  },
  {
    dest: "park-city-heber",
    title: "AvantStay large-group Park City (example 10 BR)",
    url: "https://avantstay.com/large-group-vacation-rentals/utah/park-city",
    source: "manager",
    bedrooms: 10,
    bathrooms: 6,
    sleeps: 20,
    realBedroomsConfirmed: false,
    hasPool: false,
    hasGameRoom: true,
    hasTheater: false,
    parkingSpaces: 4,
    status: "scored",
    finalized: false,
    submitterKey: "nashville",
    lat: 40.65,
    lng: -111.49,
  },
  {
    dest: "orlando-reunion",
    title: "Reunion Resort 992 (8 BR)",
    url: "https://www.thetopvillas.com/en_us/destinations/florida/orlando/reunion-resort/reunion-resort-992",
    source: "manager",
    bedrooms: 8,
    bathrooms: 8.5,
    sleeps: 16,
    realBedroomsConfirmed: true,
    hasPool: true,
    hasGameRoom: true,
    hasTheater: true,
    parkingSpaces: 4,
    status: "scored",
    finalized: true,
    submitterKey: "florida",
    notes: "Themed kids bunk rooms; private pool; resort amenities",
    lat: 28.27,
    lng: -81.59,
  },
  {
    dest: "orlando-reunion",
    title: "ChampionsGate 447 (9 BR)",
    url: "https://www.thetopvillas.com/en_us/destinations/florida/orlando/championsgate/championsgate-447",
    source: "manager",
    bedrooms: 9,
    bathrooms: 6,
    sleeps: 18,
    realBedroomsConfirmed: true,
    hasPool: true,
    hasGameRoom: true,
    hasTheater: false,
    parkingSpaces: 4,
    status: "scored",
    finalized: true,
    submitterKey: "florida",
    notes: "Watch bathroom count — filter for 6+",
    lat: 28.26,
    lng: -81.62,
  },
  {
    dest: "orlando-reunion",
    title: "ChampionsGate 2188 (8 BR)",
    url: "https://www.thetopvillas.com/en_us/destinations/florida/orlando/championsgate/championsgate-2188",
    source: "manager",
    bedrooms: 8,
    bathrooms: 6,
    sleeps: 16,
    realBedroomsConfirmed: true,
    hasPool: true,
    hasGameRoom: true,
    hasTheater: true,
    parkingSpaces: 3,
    status: "scored",
    finalized: true,
    submitterKey: "rockford",
    lat: 28.265,
    lng: -81.625,
  },
  {
    dest: "gatlinburg-pigeon-forge",
    title: "Smoky Mountain Lodge 9 BR (indoor pool)",
    url: "https://www.cabinsofthesmokymountains.com/gatlinburg-pigeon-forge-cabin-rentals/8-20-bedroom",
    source: "manager",
    bedrooms: 9,
    bathrooms: 9,
    sleeps: 22,
    realBedroomsConfirmed: true,
    hasPool: true,
    hasGameRoom: true,
    hasTheater: true,
    parkingSpaces: 5,
    status: "scored",
    finalized: true,
    submitterKey: "rockford",
    notes: "Named large-cabin inventory; beds treated as verified in research packet",
    lat: 35.805,
    lng: -83.545,
  },
  {
    dest: "blue-ridge-ga",
    title: "Toccoa River 7 BR lodge (sleeps 14 exactly)",
    url: "https://www.cabin-rentals-of-georgia.com/cabins/7-bedroom/all",
    source: "manager",
    bedrooms: 7,
    bathrooms: 5,
    sleeps: 14,
    realBedroomsConfirmed: false,
    hasPool: false,
    hasGameRoom: false,
    hasTheater: false,
    parkingSpaces: 3,
    status: "scored",
    finalized: false,
    submitterKey: "rockford",
    zeroMargin: true,
    notes: "Only realistic 7BR — beds unconfirmed / zero margin; scored but off ballot",
    lat: 34.87,
    lng: -84.33,
  },
  {
    dest: "branson",
    title: "Table Rock Lake lodge example (8 BR search target)",
    url: "https://www.vrbo.com/search?destination=Branson%2C+MO&adults=14",
    source: "vrbo",
    bedrooms: 8,
    bathrooms: 6,
    sleeps: 16,
    realBedroomsConfirmed: false,
    hasPool: true,
    hasGameRoom: true,
    hasTheater: false,
    parkingSpaces: 3,
    status: "pending_score",
    finalized: false,
    submitterKey: "rockford",
    notes: "Placeholder search target — beds unconfirmed; replace with concrete listing",
    lat: 36.64,
    lng: -93.25,
  },
];

const attractions: Array<{
  dest: string;
  name: string;
  description: string;
  category: string;
  age2to4: number;
  age4to8: number;
  age8to11: number;
  rainyDay: boolean;
}> = [
  { dest: "gatlinburg-pigeon-forge", name: "Dollywood", description: "Rides spanning toddler to 11yo", category: "theme_park", age2to4: 4, age4to8: 5, age8to11: 5, rainyDay: false },
  { dest: "gatlinburg-pigeon-forge", name: "Great Smoky Mountains NP — Cades Cove", description: "Wildlife loop, short walks", category: "nature", age2to4: 4, age4to8: 5, age8to11: 5, rainyDay: false },
  { dest: "gatlinburg-pigeon-forge", name: "Anakeesta", description: "Mountain adventure park", category: "activity", age2to4: 3, age4to8: 5, age8to11: 5, rainyDay: false },
  { dest: "gatlinburg-pigeon-forge", name: "Ripley's Aquarium of the Smokies", description: "Indoor aquarium", category: "indoor", age2to4: 5, age4to8: 5, age8to11: 4, rainyDay: true },
  { dest: "estes-park-ymca", name: "Rocky Mountain National Park", description: "Lakeside walks + wildlife; timed entry in summer", category: "nature", age2to4: 4, age4to8: 5, age8to11: 5, rainyDay: false },
  { dest: "estes-park-ymca", name: "YMCA campus activities", description: "Pool, mini golf, archery, roller skating, playground", category: "on_site", age2to4: 5, age4to8: 5, age8to11: 5, rainyDay: true },
  { dest: "estes-park-ymca", name: "Downtown Estes Park", description: "Riverwalk, ice cream, mild shopping", category: "town", age2to4: 4, age4to8: 4, age8to11: 3, rainyDay: false },
  { dest: "park-city-heber", name: "Utah Olympic Park", description: "Bobsled/zip for older kids; free museum for little ones", category: "activity", age2to4: 3, age4to8: 4, age8to11: 5, rainyDay: false },
  { dest: "park-city-heber", name: "Park City alpine slide / mountain coaster", description: "Mountain coaster thrills", category: "activity", age2to4: 2, age4to8: 4, age8to11: 5, rainyDay: false },
  { dest: "park-city-heber", name: "Homestead Crater", description: "Swim in a warm geothermal crater", category: "water", age2to4: 3, age4to8: 4, age8to11: 4, rainyDay: true },
  { dest: "park-city-heber", name: "Heber Valley Railroad", description: "Scenic train ride", category: "activity", age2to4: 5, age4to8: 5, age8to11: 4, rainyDay: false },
  { dest: "orlando-reunion", name: "Resort water park / lazy river", description: "On-property splash for all ages", category: "on_site", age2to4: 5, age4to8: 5, age8to11: 5, rainyDay: false },
  { dest: "orlando-reunion", name: "Theme parks (Disney/Universal)", description: "World-class but pricey + June heat", category: "theme_park", age2to4: 4, age4to8: 5, age8to11: 5, rainyDay: true },
  { dest: "orlando-reunion", name: "Blue Spring / Wekiwa Springs", description: "Manatees + swimming day trip", category: "nature", age2to4: 4, age4to8: 4, age8to11: 4, rainyDay: false },
  { dest: "branson", name: "Silver Dollar City", description: "Excellent 2–11 age spread", category: "theme_park", age2to4: 4, age4to8: 5, age8to11: 5, rainyDay: false },
  { dest: "blue-ridge-ga", name: "Blue Ridge Scenic Railway", description: "Train ride through mountains", category: "activity", age2to4: 5, age4to8: 5, age8to11: 4, rainyDay: false },
  { dest: "blue-ridge-ga", name: "Amicalola Falls", description: "Tallest cascading waterfall in GA", category: "nature", age2to4: 3, age4to8: 4, age8to11: 4, rainyDay: false },
];

async function main() {
  console.log("Seeding Family Vacation 2027…");
  await prisma.vote.deleteMany();
  await prisma.attraction.deleteMany();
  await prisma.lodging.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tripSettings.deleteMany();

  await prisma.tripSettings.create({
    data: {
      id: 1,
      primaryStart: "2027-06-12",
      primaryEnd: "2027-06-19",
      backupStart: "2027-06-19",
      backupEnd: "2027-06-26",
      bookBy: "2026-09-30",
      votingOpen: true,
      groupSize: 14,
      kidsAges: "11,8,4,2",
      minBedrooms: 7,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: (process.env.ADMIN_EMAIL || "joe@example.com").toLowerCase(),
      name: "Joe",
      household: "florida",
      role: "admin",
    },
  });

  // Four household seed users — each may finalize ≤2 lodgings for the ballot
  const demo = await prisma.user.create({
    data: {
      email: "demo@family.local",
      name: "Demo Household",
      household: "gig_harbor_wa",
      role: "member",
    },
  });
  const floridaUser = await prisma.user.create({
    data: {
      email: "florida@family.local",
      name: "Florida Household",
      household: "florida",
      role: "member",
    },
  });
  const nashvilleUser = await prisma.user.create({
    data: {
      email: "nashville@family.local",
      name: "Nashville Household",
      household: "nashville",
      role: "member",
    },
  });
  const rockfordUser = await prisma.user.create({
    data: {
      email: "rockford@family.local",
      name: "Rockford Household",
      household: "rockford_il",
      role: "member",
    },
  });

  const usersByKey: Record<string, { id: string }> = {
    demo,
    florida: floridaUser,
    nashville: nashvilleUser,
    rockford: rockfordUser,
    admin,
  };

  const destMap = new Map<string, string>();
  for (const d of destinations) {
    const row = await prisma.destination.create({
      data: {
        slug: d.slug,
        name: d.name,
        shortName: d.shortName,
        state: d.state,
        lat: d.lat,
        lng: d.lng,
        status: d.status,
        lodgingFeasibility: d.lodgingFeasibility,
        onSiteAmenities: d.onSiteAmenities,
        travelBurden: d.travelBurden,
        kidActivities: d.kidActivities,
        natureNp: d.natureNp,
        overflow: d.overflow,
        juneCost: d.juneCost,
        totalScore: d.totalScore,
        airports: JSON.stringify(d.airports),
        seaPattern: d.seaPattern,
        summary: d.summary,
        callout: d.callout,
        travelDifficulty: JSON.stringify(d.travelDifficulty),
        disqualified: d.disqualified,
        sortOrder: d.sortOrder,
      },
    });
    destMap.set(d.slug, row.id);
  }

  const finalizedCountByUser = new Map<string, number>();

  for (const l of lodgings) {
    const destinationId = destMap.get(l.dest);
    if (!destinationId) continue;
    const fields = {
      bedrooms: l.bedrooms,
      sleeps: l.sleeps,
      realBedroomsConfirmed: l.realBedroomsConfirmed,
      hasPool: l.hasPool,
      hasGameRoom: l.hasGameRoom,
      hasTheater: l.hasTheater,
      bathrooms: l.bathrooms,
      parkingSpaces: l.parkingSpaces,
      zeroMargin: l.zeroMargin ?? false,
    };
    const qualifies = lodgingQualifies(fields);
    const submitter = usersByKey[l.submitterKey || "admin"] || admin;
    let finalized = Boolean(l.finalized && qualifies);
    if (finalized) {
      const n = finalizedCountByUser.get(submitter.id) || 0;
      if (n >= 2) {
        finalized = false;
      } else {
        finalizedCountByUser.set(submitter.id, n + 1);
      }
    }
    await prisma.lodging.create({
      data: {
        destinationId,
        title: l.title,
        url: l.url,
        source: l.source,
        lat: l.lat,
        lng: l.lng,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        sleeps: l.sleeps,
        realBedroomsConfirmed: l.realBedroomsConfirmed,
        hasPool: l.hasPool,
        hasGameRoom: l.hasGameRoom,
        hasTheater: l.hasTheater,
        parkingSpaces: l.parkingSpaces,
        status: l.status,
        qualifies,
        lodgingScore: scoreLodging(fields),
        notes: l.notes,
        finalized,
        zeroMargin: l.zeroMargin ?? false,
        submitterId: submitter.id,
      },
    });
  }

  for (const a of attractions) {
    const destinationId = destMap.get(a.dest);
    if (!destinationId) continue;
    await prisma.attraction.create({
      data: {
        destinationId,
        name: a.name,
        description: a.description,
        category: a.category,
        age2to4: a.age2to4,
        age4to8: a.age4to8,
        age8to11: a.age8to11,
        rainyDay: a.rainyDay,
      },
    });
  }

  const ballot = await prisma.lodging.findMany({
    where: { finalized: true, qualifies: true },
    include: { submitter: { select: { email: true, household: true } } },
  });
  const byHousehold = new Map<string, number>();
  for (const b of ballot) {
    const h = b.submitter?.household || "?";
    byHousehold.set(h, (byHousehold.get(h) || 0) + 1);
  }
  console.log(`Seeded ${destinations.length} destinations, ${lodgings.length} lodgings, ${attractions.length} attractions`);
  console.log(`Admin: ${admin.email} · Households: demo, florida, nashville, rockford`);
  console.log(`Ballot: ${ballot.length} finalized qualifying lodgings`);
  for (const [h, n] of byHousehold) {
    console.log(`  ${h}: ${n} finalized (max 2)`);
    if (n > 2) throw new Error(`Seed violated finalize-exactly-2 for ${h}`);
  }
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
