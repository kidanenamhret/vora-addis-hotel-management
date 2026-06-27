export const navItems = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/rooms', 'Rooms'],
  ['/restaurant', 'Restaurant'],
  ['/gym', 'Gym'],
  ['/night-club', 'Nightclub'],
  ['/meeting-rooms', 'Meetings'],
  ['/gallery', 'Gallery'],
  ['/contact', 'Contact'],
];

export const roomTypes = [
  {
    name: 'Standard',
    price: 85,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4db85b?auto=format&fit=crop&w=900&q=80'
    ],
    details: 'Calm, efficient rooms for business and leisure stays.',
    description: 'Our Standard Room offers the perfect blend of comfort and functionality. Designed for business travelers and vacationing couples, it features a warm, inviting ambiance with premium queen bed lodging, an ergonomic workspace, and modern technology to keep you connected and productive.',
    rating: 4.6,
    reviewsCount: 98,
    bedType: 'Queen Bed',
    capacity: 2,
    size: '28 m²',
    amenitiesList: ['Queen Bed', '2 Guests', 'Free Wi-Fi', 'Air Conditioning', 'Smart TV', 'Coffee Maker', 'Private Bathroom'],
    policies: [
      'Check-in: From 2:00 PM',
      'Check-out: Until 12:00 PM',
      'Cancellation: Free up to 24 hours before check-in date.',
      'No smoking allowed inside the room.',
      'Pets: Sorry, pets are not allowed.'
    ]
  },
  {
    name: 'Deluxe',
    price: 130,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=80'
    ],
    details: 'More space, city views, and upgraded amenities.',
    description: 'Experience elevated luxury in our Deluxe Room. Featuring stunning panoramic views of Addis Ababa, this room provides extra living space, a plush king-sized bed, premium bath toiletries, and a cozy seating area perfect for winding down after a day of meetings or sightseeing.',
    rating: 4.8,
    reviewsCount: 156,
    bedType: 'King Bed',
    capacity: 2,
    size: '35 m²',
    amenitiesList: ['King Bed', '2 Guests', 'Free Wi-Fi', 'Air Conditioning', 'Smart TV', 'Coffee Maker', 'Private Bathroom', 'Breakfast Included'],
    policies: [
      'Check-in: From 2:00 PM',
      'Check-out: Until 12:00 PM',
      'Cancellation: Free up to 24 hours before check-in date.',
      'No smoking allowed inside the room.',
      'Pets: Allowed upon request (charges may apply).'
    ]
  },
  {
    name: 'Executive',
    price: 190,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=900&q=80'
    ],
    details: 'Business-ready rooms with premium work and lounge comfort.',
    description: 'The Executive Room is meticulously tailored for the modern executive. It includes dedicated lounge access, a spacious study desk, an espresso machine, and a state-of-the-art bathroom. Guests also benefit from express check-in and complimentary airport shuttle services.',
    rating: 4.9,
    reviewsCount: 84,
    bedType: 'King Bed',
    capacity: 2,
    size: '48 m²',
    amenitiesList: ['King Bed', '2 Guests', 'Free Wi-Fi', 'Air Conditioning', 'Smart TV', 'Coffee Maker', 'Private Bathroom', 'Mini Bar', 'Airport Shuttle', 'Lounge Access'],
    policies: [
      'Check-in: From 12:00 PM (Early check-in subject to availability)',
      'Check-out: Until 2:00 PM (Late check-out included)',
      'Cancellation: Free up to 12 hours before check-in date.',
      'No smoking allowed inside the room.',
      'Pets: Sorry, pets are not allowed.'
    ]
  },
  {
    name: 'Suite',
    price: 320,
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1606046604972-77cc76aee944?auto=format&fit=crop&w=900&q=80'
    ],
    details: 'Luxury suites for VIP guests, families, and longer stays.',
    description: 'Indulge in ultimate sophistication. Our signature Suites feature a separate grand living room, a dining area, a master bedroom with a super-king bed, walk-in closets, and an opulent marble bathroom with a deep soaking tub and separate rain shower. Ideal for families, honeymooners, and high-profile executives.',
    rating: 5.0,
    reviewsCount: 42,
    bedType: '2 King Beds',
    capacity: 4,
    size: '85 m²',
    amenitiesList: ['2 King Beds', '4 Guests', 'Free Wi-Fi', 'Air Conditioning', 'Smart TV', 'Coffee Maker', 'Private Bathroom', 'Living Room', 'Kitchenette', 'Dining Area', 'Complimentary Wine', '24/7 Butler Service'],
    policies: [
      'Check-in: From 12:00 PM',
      'Check-out: Until 2:00 PM',
      'Cancellation: Free cancellation anytime.',
      'No smoking allowed inside the room.',
      'Pets: Allowed upon request.'
    ]
  },
  {
    name: 'Single',
    price: 60,
    image: 'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80'
    ],
    details: 'Smart, compact rooms designed for the solo traveler.',
    description: 'Our Single Room is the perfect retreat for the independent traveler. Compact yet thoughtfully designed, it features a comfortable single bed, a streamlined work desk, high-speed Wi-Fi, and all the essentials you need for a productive and restful stay — without paying for space you don\'t need.',
    rating: 4.4,
    reviewsCount: 63,
    bedType: 'Single Bed',
    capacity: 1,
    size: '18 m²',
    amenitiesList: ['Single Bed', '1 Guest', 'Free Wi-Fi', 'Air Conditioning', 'Smart TV', 'Coffee Maker', 'Private Bathroom'],
    policies: [
      'Check-in: From 2:00 PM',
      'Check-out: Until 12:00 PM',
      'Cancellation: Free up to 24 hours before check-in date.',
      'No smoking allowed inside the room.',
      'Pets: Sorry, pets are not allowed.'
    ]
  },
  {
    name: 'Twin',
    price: 75,
    image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=900&q=80',
    images: [
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80'
    ],
    details: 'Two single beds — perfect for colleagues, friends, or siblings.',
    description: 'The Twin Room offers two separate single beds in a well-appointed, shared space — ideal for business colleagues, friends traveling together, or family members who prefer their own sleeping space. It combines practicality with comfort, featuring modern furnishings, ample storage, and all standard hotel amenities.',
    rating: 4.5,
    reviewsCount: 77,
    bedType: '2 Single Beds',
    capacity: 2,
    size: '24 m²',
    amenitiesList: ['2 Single Beds', '2 Guests', 'Free Wi-Fi', 'Air Conditioning', 'Smart TV', 'Coffee Maker', 'Private Bathroom'],
    policies: [
      'Check-in: From 2:00 PM',
      'Check-out: Until 12:00 PM',
      'Cancellation: Free up to 24 hours before check-in date.',
      'No smoking allowed inside the room.',
      'Pets: Sorry, pets are not allowed.'
    ]
  }
];

export const facilities = [
  { path: '/restaurant', title: 'Restaurant', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80', text: 'Breakfast, lunch, dinner, drinks, and desserts with integrated ordering and billing.' },
  { path: '/gym', title: 'Gym/Fitness Center', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80', text: 'Memberships, trainers, attendance, and payment tracking.' },
  { path: '/night-club', title: 'Night Club', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80', text: 'Events, VIP reservations, ticket sales, and revenue tracking.' },
  { path: '/meeting-rooms', title: 'Meeting Rooms', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80', text: 'Conference booking with capacity and equipment management.' }
];

export const faqs = [
  ['Can guests book online?', 'Yes. Guests can check availability and submit room bookings from the website.'],
  ['Which payments are supported?', 'Cash, bank transfer, and mobile payments are tracked across all revenue centers.'],
  ['Does the system support staff roles?', 'Yes. RBAC covers guests, reception, restaurant, gym, night club, accounting, managers, and administrators.'],
  ['Can meeting equipment be reserved?', 'Yes. Projectors, microphones, speakers, TV screens, and Wi-Fi can be attached to bookings.']
];
