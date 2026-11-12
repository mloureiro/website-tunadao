import type { Payload } from 'payload';

export const seedSiteSettings = async (payload: Payload) => {
  try {
    // Update site settings global
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        siteName: 'Tunadao 1998',
        siteDescription: 'Tuna da Universidade Politecnica de Viseu',
        instagram: 'https://www.instagram.com/tunadao1998/',
        facebook: 'https://www.facebook.com/tunadao1998',
        tiktok: 'https://www.tiktok.com/@tunadao1998',
        youtube: 'https://www.youtube.com/@TUNADAO1998',
        spotify: 'https://open.spotify.com/artist/7HeYIxlV5Nb1KvZkBx00sH',
      },
    });
    console.log('  Updated site settings');

    // Update contact info global
    await payload.updateGlobal({
      slug: 'contact-info',
      data: {
        email: 'tunadao@gmail.com',
        phone: '+351 928 155 399',
        address: 'Campus Politecnico de Viseu\n3504-510 Viseu',
      },
    });
    console.log('  Updated contact info');
  } catch (error) {
    console.error('  Failed to update settings:', error);
  }
};
