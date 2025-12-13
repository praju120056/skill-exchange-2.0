export interface Skill {
    _id: string;
    name: string;
    category: string;
}

export interface UserSkill {
    skillId: Skill;
    type: 'teach' | 'learn';
    proficiencyLevel: string;
}

export interface Match {
    _id: string;
    name: string;
    email: string;
    avatarUrl: string;
    matchCount: number;
    teachingSkills: UserSkill[];
    learningSkills: UserSkill[];
    matchedSkills: Skill[];
}
