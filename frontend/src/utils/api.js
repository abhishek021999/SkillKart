// Centralized API configuration

export const baseURL = 'https://skillkart-backend-i4j5.onrender.com/api';

export const endpoints = {
  // Auth
  authMe: '/auth/me',
  login: '/auth/login',
  register: '/auth/register',

  // User
  userProfile: '/users/profile',
  updateUserProfile: '/users/profile',

  // Roadmaps (learner)
  roadmaps: '/roadmaps',
  roadmapById: (id) => `/roadmaps/${id}`,
  roadmapProgress: (id) => `/roadmaps/${id}/progress`,
  topicComplete: (id, weekIndex, topicIndex) => `/roadmaps/${id}/topics/${weekIndex}/${topicIndex}/complete`,
  topicInProgress: (id, weekIndex, topicIndex) => `/roadmaps/${id}/topics/${weekIndex}/${topicIndex}/inprogress`,
  topicReset: (id, weekIndex, topicIndex) => `/roadmaps/${id}/topics/${weekIndex}/${topicIndex}/reset`,

  // Admin
  adminStats: '/admin/stats',
  adminRoadmaps: '/admin/roadmaps',
  adminRoadmapById: (id) => `/admin/roadmaps/${id}`,
  adminRoadmapProgress: (roadmapId) => `/admin/roadmaps/${roadmapId}/progress`,
  adminRoadmapWeekTopic: (roadmapId, weekIndex, topicIndex) => `/admin/roadmaps/${roadmapId}/weeks/${weekIndex}/topics/${topicIndex}`,
  adminRoadmapWeekTopics: (roadmapId, weekIndex) => `/admin/roadmaps/${roadmapId}/weeks/${weekIndex}/topics`,
  adminResourcesUpload: '/admin/resources/upload',
  adminArticles: '/admin/articles',

  // Discussions
  discussions: '/discussions',
  discussionsByCategory: (category) => `/discussions/category/${category}`,
  discussionsRoadmap: (id) => `/discussions/roadmap/${id}`,
  discussionById: (id) => `/discussions/${id}`,
  discussionComments: (discussionId) => `/discussions/${discussionId}/comments`,
  discussionCommentById: (parentId, id) => `/discussions/${parentId}/comments/${id}`,
  discussionLike: (id) => `/discussions/${id}/like`,
  discussion: (id) => `/discussions/${id}`,

}; 
