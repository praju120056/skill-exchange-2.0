import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import AnimatedCard from '../components/ui/AnimatedCard';
import SkillBadge from '../components/ui/SkillBadge';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

interface UserSkill {
    _id: string;
    skillId: {
        _id: string;
        name: string;
        category: string;
    };
    type: 'teach' | 'learn';
    proficiencyLevel: string;
}

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [teachSkills, setTeachSkills] = useState<UserSkill[]>([]);
    const [learnSkills, setLearnSkills] = useState<UserSkill[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUserSkills();
    }, [user]);

    const fetchUserSkills = async () => {
        if (!user) return;

        try {
            const response = await api.get(`/skills/user/${user.id}`);
            if (response.success) {
                const teach = response.userSkills.filter((skill: UserSkill) => skill.type === 'teach');
                const learn = response.userSkills.filter((skill: UserSkill) => skill.type === 'learn');
                setTeachSkills(teach);
                setLearnSkills(learn);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Header */}
                <AnimatedCard>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <motion.img
                            src={user?.avatarUrl}
                            alt={user?.name}
                            className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-neon"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-bold gradient-text mb-2">
                                {user?.name}
                            </h1>
                            <p className="text-gray-400 mb-4">{user?.email}</p>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <div className="px-4 py-2 bg-indigo-600/20 border border-indigo-500/50 rounded-full">
                                    <span className="text-indigo-300 font-medium">
                                        {teachSkills.length} skills to teach
                                    </span>
                                </div>
                                <div className="px-4 py-2 bg-amber-600/20 border border-amber-500/50 rounded-full">
                                    <span className="text-amber-300 font-medium">
                                        {learnSkills.length} skills to learn
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedCard>

                {/* Skills I Can Teach */}
                <AnimatedCard>
                    <div className="flex items-center gap-3 mb-4">
                        <GraduationCap className="w-6 h-6 text-indigo-400" />
                        <h2 className="text-2xl font-bold text-gray-100">I Can Teach</h2>
                    </div>
                    {isLoading ? (
                        <div className="flex flex-wrap gap-3">
                            {[...Array(3)].map((_, idx) => (
                                <div key={idx} className="skeleton h-10 w-32 rounded-full" />
                            ))}
                        </div>
                    ) : teachSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {teachSkills.map(userSkill => (
                                <SkillBadge
                                    key={userSkill._id}
                                    name={userSkill.skillId.name}
                                    category={userSkill.skillId.category}
                                    variant="primary"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No skills to teach yet. Add some on the Dashboard!</p>
                    )}
                </AnimatedCard>

                {/* Skills I Want to Learn */}
                <AnimatedCard>
                    <div className="flex items-center gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-amber-400" />
                        <h2 className="text-2xl font-bold text-gray-100">I Want to Learn</h2>
                    </div>
                    {isLoading ? (
                        <div className="flex flex-wrap gap-3">
                            {[...Array(3)].map((_, idx) => (
                                <div key={idx} className="skeleton h-10 w-32 rounded-full" />
                            ))}
                        </div>
                    ) : learnSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {learnSkills.map(userSkill => (
                                <SkillBadge
                                    key={userSkill._id}
                                    name={userSkill.skillId.name}
                                    category={userSkill.skillId.category}
                                    variant="secondary"
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No skills to learn yet. Add some on the Dashboard!</p>
                    )}
                </AnimatedCard>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
