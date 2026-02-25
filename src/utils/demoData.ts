import yogaChargerImage from 'figma:asset/a92dee39b9a1cb5d95d9106c7e4fd5913917e497.png';

// Initialize demo data for testing
export function initializeDemoData() {
  // Create a demo user if none exists
  const users = JSON.parse(localStorage.getItem('lostfound_users') || '{}');
  
  if (Object.keys(users).length === 0) {
    users['demo@lostfound.com'] = {
      name: 'Demo User',
      email: 'demo@lostfound.com',
      phone: '9876543210',
      password: 'demo123',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('lostfound_users', JSON.stringify(users));
    console.log('Demo user created! Login with: demo@lostfound.com / demo123');
  }
  
  // Add demo items with Yoga laptop charger
  const existingItems = JSON.parse(localStorage.getItem('lostfound_items') || '[]');
  
  // Only add demo items if none exist
  if (existingItems.length === 0) {
    const demoItems = [
      {
        id: 'demo-1',
        type: 'lost',
        title: 'Yoga Laptop Charger',
        description: 'Lost my laptop charger adapter for Lenovo Yoga laptop. Black rectangular adapter with yellow tip connector. Has model number printed on the side.',
        category: 'Electronics',
        location: 'Central Library, 2nd Floor',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        contactName: 'Sarah Johnson',
        contactPhone: '555-0123',
        contactEmail: 'sarah.j@example.com',
        imageUrl: yogaChargerImage,
        status: 'active',
        reportedBy: 'demo@lostfound.com'
      },
      {
        id: 'demo-2',
        type: 'found',
        title: 'Black Wallet',
        description: 'Found a black leather wallet near the cafeteria. Contains some cards and cash.',
        category: 'Wallets',
        location: 'Main Cafeteria',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        contactName: 'John Doe',
        contactPhone: '555-0456',
        contactEmail: 'john.d@example.com',
        imageUrl: null,
        status: 'active',
        reportedBy: 'demo@lostfound.com'
      },
      {
        id: 'demo-3',
        type: 'found',
        title: 'Set of Keys with Blue Keychain',
        description: 'Found a set of 4 keys attached to a blue keychain with "Best Mom" written on it. Found near the parking lot.',
        category: 'Keys',
        location: 'Parking Lot B',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        contactName: 'Mike Wilson',
        contactPhone: '555-0789',
        contactEmail: 'mike.w@example.com',
        imageUrl: null,
        status: 'active',
        reportedBy: 'demo@lostfound.com'
      }
    ];
    
    localStorage.setItem('lostfound_items', JSON.stringify(demoItems));
    console.log('Demo items added to local storage!');
  }
}
