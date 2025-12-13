import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, GraduationCap } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import AnimatedCard from '../components/ui/AnimatedCard';
import Button from '../components/ui/Button';
import SkillBadge from '../components/ui/SkillBadge';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Skill {
    _id: string;
    name: string;
    category: string;
}

interface UserSkill {
    _id: string;
    skillId: Skill;
    type: 'teach' | 'learn';
    proficiencyLevel: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'teach' | 'learn'>('teach');
    const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
    const [allSkills, setAllSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddSkill, setShowAddSkill] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUserSkills();
        fetchAllSkills();
    }, [user]);

    const fetchUserSkills = async () => {
        try {
            const response = await api.get(`/skills/user/${user?.id}`);
            if (response.success) {
                setUserSkills(response.userSkills);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllSkills = async () => {
        try {
            const response = await api.get('/skills');
            if (response.success) {
                setAllSkills(response.skills);
            }
        } catch (error: any) {
            console.error('Error fetching skills:', error);
        }
    };

    const handleAddSkill = async (skillId: string) => {
        try {
            const response = await api.post('/skills/user', {
                skillId,
                type: activeTab
            });
            if (response.success) {
                setUserSkills(prev => [...prev, response.userSkill]);
                toast.success(`Skill added to "${activeTab}" list`);
                setShowAddSkill(false);
                setSearchTerm('');
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleRemoveSkill = async (userSkillId: string) => {
        try {
            await api.delete(`/skills/user/${userSkillId}`);
            setUserSkills(prev => prev.filter(s => s._id !== userSkillId));
            toast.success('Skill removed');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredSkills = userSkills.filter(us => us.type === activeTab);
    const availableSkills = allSkills.filter(
        skill =>
            !userSkills.some(us => us.skillId._id === skill._id && us.type === activeTab) &&
            skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold gradient-text mb-2">
                        Welcome back, {user?.name}!
                    </h1>
                    <p className="text-gray-400">
                        Manage your skills and find people to exchange knowledge with
                    </p>
                </motion.div>

                {/* Skills Section */}
                <AnimatedCard>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-100">My Skills</h2>
                        <Button
                            variant="primary"
                            size="sm"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={() => setShowAddSkill(!showAddSkill)}
                        >
                            Add Skill
                        </Button>
                    </div>

                    {/* Tab Toggle */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('teach')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'teach'
                                ? 'bg-navy-600 text-white shadow-glow'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <GraduationCap className="w-5 h-5" />
                            I Can Teach
                        </button>
                        <button
                            onClick={() => setActiveTab('learn')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'learn'
                                ? 'bg-crimson-600 text-white shadow-neon'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <BookOpen className="w-5 h-5" />
                            I Want to Learn
                        </button>
                    </div>

                    {/* Add Skill Panel */}
                    {showAddSkill && (
                        <motion.div
                            className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <input
                                type="text"
                                placeholder="Search skills..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-3"
                            />
                            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                                {availableSkills.length > 0 ? (
                                    availableSkills.map(skill => (
                                        <button
                                            key={skill._id}
                                            onClick={() => handleAddSkill(skill._id)}
                                            className="w-full text-left px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex justify-between items-center"
                                        >
                                            <div>
                                                <span className="text-gray-200">{skill.name}</span>
                                                <span className="text-xs text-gray-500 ml-2">{skill.category}</span>
                                            </div>
                                            <Plus className="w-4 h-4 text-violet-400" />
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No skills found</p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Skills List */}
                    {isLoading ? (
                        <div className="flex flex-wrap gap-3">
                            {[...Array(4)].map((_, idx) => (
                                <div key={idx} className="skeleton h-10 w-32 rounded-full" />
                            ))}
                        </div>
                    ) : filteredSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {filteredSkills.map(userSkill => (
                                <SkillBadge
                                    key={userSkill._id}
                                    name={userSkill.skillId.name}
                                    category={userSkill.skillId.category}
                                    variant={activeTab === 'teach' ? 'primary' : 'secondary'}
                                    onRemove={() => handleRemoveSkill(userSkill._id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">
                            No skills in this category. Click "Add Skill" to get started!
                        </p>
                    )}
                </AnimatedCard>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AnimatedCard className="text-center">
                        <GraduationCap className="w-12 h-12 text-navy-400 mx-auto mb-3" />
                        <h3 className="text-3xl font-bold text-gray-100">
                            {userSkills.filter(s => s.type === 'teach').length}
                        </h3>
                        <p className="text-gray-400">Skills I Can Teach</p>
                    </AnimatedCard>

                    <AnimatedCard className="text-center">
                        <BookOpen className="w-12 h-12 text-crimson-400 mx-auto mb-3" />
                        <h3 className="text-3xl font-bold text-gray-100">
                            {userSkills.filter(s => s.type === 'learn').length}
                        </h3>
                        <p className="text-gray-400">Skills I Want to Learn</p>
                    </AnimatedCard>

                    <AnimatedCard className="text-center">
                        <motion.div
                            className="w-12 h-12 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            ✨
                        </motion.div>
                        <h3 className="text-3xl font-bold gradient-text">
                            Find Matches
                        </h3>
                        <p className="text-gray-400">Discover learning partners</p>
                    </AnimatedCard>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
