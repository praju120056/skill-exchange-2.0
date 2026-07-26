import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Connection from './src/models/Connection.js';
import Conversation from './src/models/Conversation.js';
import Message from './src/models/Message.js';

dotenv.config();

const seedChat = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-exchange');
        console.log('MongoDB Connected for Chat Seeding');

        const emma = await User.findOne({ email: 'emma.thompson@student.edu' });
        const liam = await User.findOne({ email: 'liam.anderson@student.edu' });
        const olivia = await User.findOne({ email: 'olivia.martinez@student.edu' });
        const noah = await User.findOne({ email: 'noah.williams@student.edu' });

        if (!emma || !liam || !olivia || !noah) {
            console.error('Users not found. Run seedUsers first.');
            process.exit(1);
        }

        // Clean existing chat data
        await Connection.deleteMany({});
        await Conversation.deleteMany({});
        await Message.deleteMany({});

        // 1. Accepted connection: Emma & Liam
        await Connection.create({ requester: liam._id, recipient: emma._id, status: 'accepted' });
        const conv1 = await Conversation.create({ participants: [emma._id, liam._id] });

        await Message.create({
            conversationId: conv1._id,
            sender: liam._id,
            text: "Hi Emma! I saw you're interested in learning Python. I can teach you Python & SQL in exchange for React!",
            timestamp: new Date(Date.now() - 3600000 * 3)
        });

        await Message.create({
            conversationId: conv1._id,
            sender: emma._id,
            text: "Hey Liam! That sounds perfect. I'd love to help you master React components and hooks.",
            timestamp: new Date(Date.now() - 3600000 * 2)
        });

        await Message.create({
            conversationId: conv1._id,
            sender: liam._id,
            text: "Awesome! Are you free for a session this weekend?",
            timestamp: new Date(Date.now() - 3600000 * 1)
        });

        // 2. Accepted connection: Emma & Olivia
        await Connection.create({ requester: emma._id, recipient: olivia._id, status: 'accepted' });
        const conv2 = await Conversation.create({ participants: [emma._id, olivia._id] });

        await Message.create({
            conversationId: conv2._id,
            sender: olivia._id,
            text: "Hey Emma, excited to connect! UI/UX design session whenever you're ready.",
            timestamp: new Date(Date.now() - 3600000 * 5)
        });

        // 3. Pending connection request to Emma from Noah
        await Connection.create({ requester: noah._id, recipient: emma._id, status: 'pending' });

        console.log('✅ Chat and Connections successfully seeded!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding chat:', err);
        process.exit(1);
    }
};

seedChat();
