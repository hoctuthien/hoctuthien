import { DataSource } from 'typeorm';
import { CategoryEntity } from '../src/modules/category/entities/category.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const categories = [
  { name: 'Web Development', slug: 'web-development' },
  { name: 'Mobile Apps', slug: 'mobile-apps' },
  { name: 'Programming Languages', slug: 'programming-languages' },
  { name: 'Game Development', slug: 'game-development' },
  { name: 'Database Design & Development', slug: 'database-design-development' },
  { name: 'Software Testing', slug: 'software-testing' },
  { name: 'Software Engineering', slug: 'software-engineering' },
  { name: 'E-Commerce Development', slug: 'e-commerce-development' },
  { name: 'Front-end Development', slug: 'front-end-development' },
  { name: 'Back-end Development', slug: 'back-end-development' },
  { name: 'Full-stack Development', slug: 'full-stack-development' },
  { name: 'DevOps & CI/CD', slug: 'devops-cicd' },
  { name: 'Blockchain & Cryptocurrency', slug: 'blockchain-cryptocurrency' },
  { name: 'Machine Learning', slug: 'machine-learning' },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence' },
  { name: 'Deep Learning', slug: 'deep-learning' },
  { name: 'Data Analysis', slug: 'data-analysis' },
  { name: 'Data Visualization', slug: 'data-visualization' },
  { name: 'Statistics', slug: 'statistics' },
  { name: 'Big Data', slug: 'big-data' },
  { name: 'Natural Language Processing', slug: 'natural-language-processing' },
  { name: 'Entrepreneurship', slug: 'entrepreneurship' },
  { name: 'Business Strategy', slug: 'business-strategy' },
  { name: 'Management', slug: 'management' },
  { name: 'Project Management', slug: 'project-management' },
  { name: 'Sales', slug: 'sales' },
  { name: 'Business Communication', slug: 'business-communication' },
  { name: 'Human Resources', slug: 'human-resources' },
  { name: 'Operations Management', slug: 'operations-management' },
  { name: 'Finance & Accounting', slug: 'finance-accounting' },
  { name: 'Real Estate', slug: 'real-estate' },
  { name: 'Supply Chain', slug: 'supply-chain' },
  { name: 'IT Certifications', slug: 'it-certifications' },
  { name: 'Network & Security', slug: 'network-security' },
  { name: 'Cyber Security', slug: 'cyber-security' },
  { name: 'Cloud Computing', slug: 'cloud-computing' },
  { name: 'Operating Systems', slug: 'operating-systems' },
  { name: 'Hardware', slug: 'hardware' },
  { name: 'Ethical Hacking', slug: 'ethical-hacking' },
  { name: 'Web Design', slug: 'web-design' },
  { name: 'Graphic Design', slug: 'graphic-design' },
  { name: 'UI/UX Design', slug: 'ui-ux-design' },
  { name: 'Design Tools', slug: 'design-tools' },
  { name: '3D & Animation', slug: '3d-animation' },
  { name: 'Fashion Design', slug: 'fashion-design' },
  { name: 'Interior Design', slug: 'interior-design' },
  { name: 'Motion Graphics', slug: 'motion-graphics' },
  { name: 'Digital Marketing', slug: 'digital-marketing' },
  { name: 'Search Engine Optimization (SEO)', slug: 'seo' },
  { name: 'Social Media Marketing', slug: 'social-media-marketing' },
  { name: 'Content Marketing', slug: 'content-marketing' },
  { name: 'Email Marketing', slug: 'email-marketing' },
  { name: 'Public Relations', slug: 'public-relations' },
  { name: 'Branding', slug: 'branding' },
  { name: 'Advertising', slug: 'advertising' },
  { name: 'Cooking & Baking', slug: 'cooking-baking' },
  { name: 'Travel & Tourism', slug: 'travel-tourism' },
  { name: 'Arts & Crafts', slug: 'arts-crafts' },
  { name: 'Pet Care & Training', slug: 'pet-care-training' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Home Improvement', slug: 'home-improvement' },
  { name: 'Beauty & Makeup', slug: 'beauty-makeup' },
  { name: 'Floristry', slug: 'floristry' },
  { name: 'Fitness', slug: 'fitness' },
  { name: 'Yoga', slug: 'yoga' },
  { name: 'Meditation & Mindfulness', slug: 'meditation-mindfulness' },
  { name: 'Nutrition & Diet', slug: 'nutrition-diet' },
  { name: 'Mental Health', slug: 'mental-health' },
  { name: 'Self Defense', slug: 'self-defense' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Leadership', slug: 'leadership' },
  { name: 'Personal Productivity', slug: 'personal-productivity' },
  { name: 'Public Speaking', slug: 'public-speaking' },
  { name: 'Emotional Intelligence', slug: 'emotional-intelligence' },
  { name: 'Time Management', slug: 'time-management' },
  { name: 'Career Development', slug: 'career-development' },
  { name: 'Memory & Study Skills', slug: 'memory-study-skills' },
  { name: 'Financial Literacy', slug: 'financial-literacy' },
  { name: 'Digital Photography', slug: 'digital-photography' },
  { name: 'Photography Fundamentals', slug: 'photography-fundamentals' },
  { name: 'Video Editing', slug: 'video-editing' },
  { name: 'Video Production', slug: 'video-production' },
  { name: 'Commercial Photography', slug: 'commercial-photography' },
  { name: 'Cinematography', slug: 'cinematography' },
  { name: 'Instruments', slug: 'instruments' },
  { name: 'Music Production', slug: 'music-production' },
  { name: 'Music Theory', slug: 'music-theory' },
  { name: 'Singing & Vocals', slug: 'singing-vocals' },
  { name: 'Music Software', slug: 'music-software' },
  { name: 'English Language', slug: 'english-language' },
  { name: 'Foreign Languages', slug: 'foreign-languages' },
  { name: 'Mathematics', slug: 'mathematics' },
  { name: 'Science', slug: 'science' },
  { name: 'Humanities', slug: 'humanities' },
  { name: 'Test Prep', slug: 'test-prep' },
  { name: 'Research Methodology', slug: 'research-methodology' },
  { name: 'Online Education', slug: 'online-education' },
  { name: 'Microsoft Excel', slug: 'microsoft-excel' },
  { name: 'Microsoft Office Suite', slug: 'microsoft-office-suite' },
  { name: 'Google Workspace', slug: 'google-workspace' },
  { name: 'SAP / ERP Systems', slug: 'sap-erp-systems' },
  { name: 'Microeconomics', slug: 'microeconomics' },
  { name: 'Macroeconomics', slug: 'macroeconomics' },
  { name: 'Behavioral Economics', slug: 'behavioral-economics' },
  { name: 'International Trade', slug: 'international-trade' },
  { name: 'Econometrics', slug: 'econometrics' },
  { name: 'Economic History', slug: 'economic-history' },
  { name: 'Development Economics', slug: 'development-economics' },
  { name: 'Circular Economy', slug: 'circular-economy' },
  { name: 'Environmental Economics', slug: 'environmental-economics' },
  { name: 'Political Economy', slug: 'political-economy' },
  { name: 'Bitcoin & Blockchain Fundamentals', slug: 'bitcoin-blockchain-fundamentals' },
  { name: 'Ethereum & Smart Contracts', slug: 'ethereum-smart-contracts' },
  { name: 'Decentralized Finance (DeFi)', slug: 'defi' },
  { name: 'NFTs & Digital Art', slug: 'nfts-digital-art' },
  { name: 'Crypto Trading & Technical Analysis', slug: 'crypto-trading-technical-analysis' },
  { name: 'Web3 Development', slug: 'web3-development' },
  { name: 'Metaverse & Virtual Worlds', slug: 'metaverse-virtual-worlds' },
  { name: 'Tokenomics', slug: 'tokenomics' },
  { name: 'DAO (Decentralized Autonomous Organizations)', slug: 'dao' },
  { name: 'Crypto Security & Wallet Management', slug: 'crypto-security-wallet-management' },
  { name: 'Mining & Staking', slug: 'mining-staking' },
  { name: 'Art History', slug: 'art-history' },
  { name: 'World Religions', slug: 'world-religions' },
  { name: 'Sociology', slug: 'sociology' },
  { name: 'Anthropology', slug: 'anthropology' },
  { name: 'Mythology & Folklore', slug: 'mythology-folklore' },
  { name: 'Cultural Heritage', slug: 'cultural-heritage' },
  { name: 'Cross-Cultural Communication', slug: 'cross-cultural-communication' },
  { name: 'Philosophy', slug: 'philosophy' },
  { name: 'Ethics & Morality', slug: 'ethics-morality' },
  { name: 'Modern History', slug: 'modern-history' },
  { name: 'Asian Studies', slug: 'asian-studies' },
  { name: 'European Literature', slug: 'european-literature' },
  { name: 'Business Law', slug: 'business-law' },
  { name: 'International Law', slug: 'international-law' },
  { name: 'Intellectual Property', slug: 'intellectual-property' },
  { name: 'Political Science', slug: 'political-science' },
  { name: 'Human Rights', slug: 'human-rights' },
  { name: 'General Psychology', slug: 'general-psychology' },
  { name: 'Child Psychology', slug: 'child-psychology' },
  { name: 'Cognitive Psychology', slug: 'cognitive-psychology' },
  { name: 'Social Psychology', slug: 'social-psychology' },
  { name: 'Forensic Psychology', slug: 'forensic-psychology' },
  { name: 'Sustainability & Green Living', slug: 'sustainability-green-living' },
  { name: 'Urban Planning', slug: 'urban-planning' },
  { name: 'Astronomy & Space Science', slug: 'astronomy-space-science' },
  { name: 'Journalism & Media', slug: 'journalism-media' },
  { name: 'Creative Writing', slug: 'creative-writing' },
  { name: 'Public Policy', slug: 'public-policy' },
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [CategoryEntity],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established.');

    const repository = dataSource.getRepository(CategoryEntity);

    for (const cat of categories) {
      const existing = await repository.findOneBy({ slug: cat.slug });
      if (!existing) {
        const newCat = repository.create({
          ...cat,
          status: 'active',
          metadata: {},
        });
        await repository.save(newCat);
        console.log(`Inserted: ${cat.name}`);
      } else {
        console.log(`Skipped (exists): ${cat.name}`);
      }
    }

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
