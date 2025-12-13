import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Skill from './src/models/Skill.js';

dotenv.config();

const skills = [
    // Programming
    { name: 'react', category: 'Programming' },
    { name: 'node.js', category: 'Programming' },
    { name: 'python', category: 'Programming' },
    { name: 'javascript', category: 'Programming' },
    { name: 'typescript', category: 'Programming' },
    { name: 'java', category: 'Programming' },
    { name: 'c++', category: 'Programming' },
    { name: 'go', category: 'Programming' },
    { name: 'rust', category: 'Programming' },
    { name: 'sql', category: 'Programming' },

    // Design
    { name: 'figma', category: 'Design' },
    { name: 'adobe photoshop', category: 'Design' },
    { name: 'adobe illustrator', category: 'Design' },
    { name: 'ui/ux design', category: 'Design' },
    { name: 'graphic design', category: 'Design' },
    { name: '3d modeling', category: 'Design' },

    // Marketing
    { name: 'seo', category: 'Marketing' },
    { name: 'content marketing', category: 'Marketing' },
    { name: 'social media marketing', category: 'Marketing' },
    { name: 'email marketing', category: 'Marketing' },
    { name: 'copywriting', category: 'Marketing' },

    // Business
    { name: 'project management', category: 'Business' },
    { name: 'business analysis', category: 'Business' },
    { name: 'financial planning', category: 'Business' },
    { name: 'sales', category: 'Business' },

    // Music
    { name: 'guitar', category: 'Music' },
    { name: 'piano', category: 'Music' },
    { name: 'singing', category: 'Music' },
    { name: 'music production', category: 'Music' },
    { name: 'drums', category: 'Music' },

    // Language
    { name: 'spanish', category: 'Language' },
    { name: 'french', category: 'Language' },
    { name: 'german', category: 'Language' },
    { name: 'mandarin', category: 'Language' },
    { name: 'japanese', category: 'Language' },
    { name: 'english', category: 'Language' },

    // Writing
    { name: 'creative writing', category: 'Writing' },
    { name: 'technical writing', category: 'Writing' },
    { name: 'blogging', category: 'Writing' },

    // Fitness
    { name: 'yoga', category: 'Fitness' },
    { name: 'weight training', category: 'Fitness' },
    { name: 'running', category: 'Fitness' },
    { name: 'martial arts', category: 'Fitness' },

    // Cooking
    { name: 'baking', category: 'Cooking' },
    { name: 'italian cooking', category: 'Cooking' },
    { name: 'asian cooking', category: 'Cooking' },
    { name: 'vegan cooking', category: 'Cooking' },

    // Photography
    { name: 'portrait photography', category: 'Photography' },
    { name: 'landscape photography', category: 'Photography' },
    { name: 'photo editing', category: 'Photography' },

    // Video Editing
    { name: 'video editing', category: 'Video Editing' },
    { name: 'motion graphics', category: 'Video Editing' },
    { name: 'color grading', category: 'Video Editing' },
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing skills
        await Skill.deleteMany({});
        console.log('Cleared existing skills');

        // Insert new skills
        await Skill.insertMany(skills);
        console.log(`✅ Successfully seeded ${skills.length} skills`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
