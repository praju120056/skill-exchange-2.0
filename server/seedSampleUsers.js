import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import Skill from './src/models/Skill.js';
import UserSkill from './src/models/UserSkill.js';

dotenv.config();

// Sample student users
const sampleUsers = [
    { name: 'Emma Thompson', email: 'emma.thompson@student.edu', password: 'password123' },
    { name: 'Liam Anderson', email: 'liam.anderson@student.edu', password: 'password123' },
    { name: 'Olivia Martinez', email: 'olivia.martinez@student.edu', password: 'password123' },
    { name: 'Noah Williams', email: 'noah.williams@student.edu', password: 'password123' },
    { name: 'Ava Garcia', email: 'ava.garcia@student.edu', password: 'password123' },
    { name: 'Ethan Brown', email: 'ethan.brown@student.edu', password: 'password123' },
    { name: 'Sophia Davis', email: 'sophia.davis@student.edu', password: 'password123' },
    { name: 'Mason Rodriguez', email: 'mason.rodriguez@student.edu', password: 'password123' },
    { name: 'Isabella Wilson', email: 'isabella.wilson@student.edu', password: 'password123' },
    { name: 'Lucas Moore', email: 'lucas.moore@student.edu', password: 'password123' },
    { name: 'Mia Taylor', email: 'mia.taylor@student.edu', password: 'password123' },
    { name: 'James Lee', email: 'james.lee@student.edu', password: 'password123' },
    { name: 'Charlotte Harris', email: 'charlotte.harris@student.edu', password: 'password123' },
    { name: 'Benjamin Clark', email: 'benjamin.clark@student.edu', password: 'password123' },
    { name: 'Amelia Lewis', email: 'amelia.lewis@student.edu', password: 'password123' },
];

// Skill assignments for variety (skill name, type)
const skillAssignments = {
    0: { teach: ['react', 'javascript'], learn: ['python', 'machine learning'] },
    1: { teach: ['python', 'sql'], learn: ['react', 'ui/ux design'] },
    2: { teach: ['figma', 'ui/ux design'], learn: ['javascript', 'node.js'] },
    3: { teach: ['node.js', 'mongodb'], learn: ['figma', 'graphic design'] },
    4: { teach: ['spanish', 'english'], learn: ['french', 'video editing'] },
    5: { teach: ['guitar', 'music production'], learn: ['python', 'django'] },
    6: { teach: ['yoga', 'fitness training'], learn: ['photography', 'video editing'] },
    7: { teach: ['java', 'spring boot'], learn: ['react', 'typescript'] },
    8: { teach: ['photography', 'photo editing'], learn: ['instagram marketing', 'copywriting'] },
    9: { teach: ['content marketing', 'seo'], learn: ['web development', 'javascript'] },
    10: { teach: ['creative writing', 'blogging'], learn: ['seo', 'social media marketing'] },
    11: { teach: ['typescript', 'angular'], learn: ['aws', 'devops'] },
    12: { teach: ['data analysis', 'excel'], learn: ['python', 'data visualization'] },
    13: { teach: ['video editing', 'premiere pro'], learn: ['motion graphics', 'after effects'] },
    14: { teach: ['cooking', 'italian cuisine'], learn: ['nutrition', 'meal planning'] },
};

const seedSampleData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await UserSkill.deleteMany({});
        console.log('Cleared existing users and user skills');

        // Get all skills
        const allSkills = await Skill.find();
        const skillMap = {};
        allSkills.forEach(skill => {
            skillMap[skill.name.toLowerCase()] = skill._id;
        });

        // Create users and assign skills
        for (let i = 0; i < sampleUsers.length; i++) {
            const userData = sampleUsers[i];

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            // Create user
            const user = await User.create({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
            });

            console.log(`✓ Created user: ${user.name}`);

            // Assign teach skills
            const assignments = skillAssignments[i];
            if (assignments) {
                for (const skillName of assignments.teach) {
                    const skillId = skillMap[skillName.toLowerCase()];
                    if (skillId) {
                        await UserSkill.create({
                            userId: user._id,
                            skillId: skillId,
                            type: 'teach',
                            proficiencyLevel: ['intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 3)]
                        });
                    }
                }

                // Assign learn skills
                for (const skillName of assignments.learn) {
                    const skillId = skillMap[skillName.toLowerCase()];
                    if (skillId) {
                        await UserSkill.create({
                            userId: user._id,
                            skillId: skillId,
                            type: 'learn',
                            proficiencyLevel: 'beginner'
                        });
                    }
                }
            }
        }

        console.log(`\n✅ Successfully created ${sampleUsers.length} sample students with skills!`);
        console.log('\nSample credentials:');
        console.log('Email: emma.thompson@student.edu');
        console.log('Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding sample data:', error);
        process.exit(1);
    }
};

seedSampleData();
