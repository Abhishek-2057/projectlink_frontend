export type UserRole = 'student' | 'company' | 'admin';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface IEducationItem {
  id?: string;
  degree: string;
  college: string;
  duration: string;
  cgpa?: string | number;
}

export interface IWorkExperienceItem {
  id?: string;
  role: string;
  company: string;
  duration: string;
  description: string;
  type?: 'job' | 'internship';
}

export interface ITrainingCourseItem {
  id?: string;
  title: string;
  organization?: string;
  year?: string;
  certificateUrl?: string;
  link?: string;
}

export interface IProjectItem {
  id?: string;
  title: string;
  description: string;
  technologies?: string[];
  link?: string;
  githubUrl?: string;
}

export interface IPortfolioItem {
  id?: string;
  name: string;
  url: string;
}

export interface IStudentProfile {
  _id: string;
  userId: string;
  user?: IUser;
  college: string;
  degree: string;
  graduationYear: number;
  cgpa: number;
  department?: string;
  bio: string;
  phone?: string;
  skills: string[];
  experience: {
    title: string;
    organization: string;
    duration: string;
    description: string;
  }[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
    link?: string;
    githubUrl?: string;
  }[];
  certifications: string[];
  resumeUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  availability: 'immediate' | 'part_time' | 'full_time' | 'not_available';
  isPublic: boolean;
  careerObjective?: string;
  educationList?: IEducationItem[];
  workExperienceList?: IWorkExperienceItem[];
  extraCurricular?: string[];
  trainingsCourses?: ITrainingCourseItem[];
  projectList?: IProjectItem[];
  portfolioList?: IPortfolioItem[];
  accomplishments?: string[];
  keyHighlights?: string[];
  teams?: ITeam[];
}

export interface IParsedResume {
  personal_information: {
    full_name: string;
    professional_bio: string;
  };
  key_highlights?: string[];
  academic_information: {
    college_institute_name: string;
    degree_major: string;
    graduation_year: string | number;
    current_cgpa: string | number;
  };
  technical_stack_skills: {
    skills: string[];
  };
  social_portfolio_links: {
    github_profile_url: string | null;
    linkedin_url: string | null;
    personal_website: string | null;
  };
  additional_sections: {
    career_objective: string | null;
    work_experience: {
      company: string;
      role: string;
      duration: string;
      description: string;
    }[];
    extra_curricular_activities: string[];
    trainings_courses: {
      title: string;
      organization: string;
      year: string;
    }[];
    academic_personal_projects: {
      project_name: string;
      description: string;
      tech_stack: string[];
    }[];
    portfolio_work_samples: string[];
    accomplishments_additional_details: string[];
  };
}

export interface ICompanyProfile {
  _id: string;
  userId: string;
  user?: IUser;
  companyName: string;
  logo?: string;
  website: string;
  industry: string;
  companySize: string;
  location: string;
  contactPerson: string;
  contactPhone?: string;
  description: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationDocuments?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface ITeam {
  _id: string;
  name: string;
  description: string;
  leaderId: string;
  leader?: IUser;
  college: string;
  skills: string[];
  memberCount: number;
  avatar?: string;
  completedProjectsCount: number;
  rating?: number;
  isPublic: boolean;
  members?: {
    _id: string;
    userId: string;
    name: string;
    email?: string;
    avatar?: string;
    role: 'leader' | 'member';
    joinedAt: string;
    degree?: string;
    cgpa?: number;
    skills?: string[];
    githubUrl?: string;
  }[];
}

export interface IProject {
  _id: string;
  companyId: string;
  company?: ICompanyProfile;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  problemStatement: string;
  goals: string[];
  objectives: string[];
  deliverables: string[];
  requiredSkills: string[];
  optionalSkills: string[];
  preferredTeamSize: number;
  durationWeeks: number;
  startDate: string;
  deadline: string;
  workMode: 'remote' | 'hybrid' | 'onsite';
  location: string;
  compensationType: 'paid' | 'sponsored' | 'academic' | 'unpaid';
  budgetOrStipend?: string;
  status: 'draft' | 'published' | 'paused' | 'closed' | 'in_progress' | 'completed' | 'archived';
  applicantCount: number;
  bookmarksCount: number;
  isBookmarked?: boolean;
  hasApplied?: boolean;
  matchScore?: number;
  matchReasons?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'shortlisted'
  | 'assessment_sent'
  | 'assessment_submitted'
  | 'interview_scheduled'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export interface IApplication {
  _id: string;
  projectId: string;
  project?: IProject;
  applicantType: 'individual' | 'team';
  studentId?: string;
  student?: IUser;
  studentProfile?: IStudentProfile;
  teamId?: string;
  team?: ITeam;
  teamDetails?: any;
  coverLetter: string;
  proposal?: string;
  portfolioLinks?: string[];
  answers?: { question: string; answer: string }[];
  status: ApplicationStatus;
  statusHistory: {
    status: ApplicationStatus;
    changedBy: string;
    timestamp: string;
    reason?: string;
  }[];
  company?: ICompanyProfile;
  appliedAt: string;
  updatedAt: string;
}

export interface ITask {
  _id: string;
  workspaceId: string;
  milestoneId?: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
  comments: {
    _id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
}

export interface IMilestone {
  _id: string;
  workspaceId: string;
  title: string;
  description: string;
  deadline: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface IDeliverable {
  _id: string;
  workspaceId: string;
  title: string;
  description: string;
  fileUrl?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  submittedBy: string;
  submittedByName?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'revision_requested';
  feedback?: string;
}

export interface IProjectWorkspace {
  _id: string;
  projectId: string;
  project?: IProject;
  companyId: string;
  company?: ICompanyProfile;
  applicationId: string;
  applicantType: 'individual' | 'team';
  studentId?: string;
  teamId?: string;
  status: 'active' | 'completed' | 'paused';
  repositoryUrl?: string;
  liveDemoUrl?: string;
  documentationUrl?: string;
  finalFeedback?: string;
  finalRating?: number;
  completedAt?: string;
  createdAt: string;
}

export interface IConversation {
  _id: string;
  type: 'direct' | 'project';
  participants: string[];
  participantUsers?: IUser[];
  projectId?: string;
  title?: string;
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
  unreadCount?: number;
  updatedAt: string;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  attachments?: string[];
  readBy: string[];
  createdAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
