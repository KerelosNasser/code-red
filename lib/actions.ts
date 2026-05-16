"use server"

export type {
  User,
  Team,
  AdminProfile,
  AccessCheckPayload,
  ServiceResponse,
  AccessCheckData,
  CourseActor,
  CourseInput,
  AdminNotification,
} from "./db/services"

import {
  checkUserAccess as dbCheckUserAccess,
  getCourses as dbGetCourses,
  listCoursesForActor as dbListCoursesForActor,
  getCourseForEdit as dbGetCourseForEdit,
  saveCourseDraft as dbSaveCourseDraft,
  publishCourse as dbPublishCourse,
  deleteCourseForActor as dbDeleteCourseForActor,
  updateLessonMedia as dbUpdateLessonMedia,
  updateCourseThumbnail as dbUpdateCourseThumbnail,
  createAdminNotification as dbCreateAdminNotification,
  listAdminNotifications as dbListAdminNotifications,
  markAdminNotificationRead as dbMarkAdminNotificationRead,
  getProducts as dbGetProducts,
  getUserAssets as dbGetUserAssets,
  getManagedUsers as dbGetManagedUsers,
  upsertUser as dbUpsertUser,
  deleteUser as dbDeleteUser,
  getTeams as dbGetTeams,
  createTeam as dbCreateTeam,
  deleteTeam as dbDeleteTeam,
  getAdminProfile as dbGetAdminProfile,
  updateAdminProfile as dbUpdateAdminProfile,
  submitPurchase as dbSubmitPurchase,
  type AccessCheckPayload,
  type CourseActor,
  type CourseInput,
  type User
} from "./db/services"

export async function checkUserAccessAction(payload: AccessCheckPayload) {
  return dbCheckUserAccess(payload)
}

export async function getCoursesAction() {
  return dbGetCourses()
}

export async function listCoursesForActorAction(actor: CourseActor) {
  return dbListCoursesForActor(actor)
}

export async function getCourseForEditAction(courseId: string, actor: CourseActor) {
  return dbGetCourseForEdit(courseId, actor)
}

export async function saveCourseDraftAction(payload: CourseInput, actor: CourseActor) {
  return dbSaveCourseDraft(payload, actor)
}

export async function publishCourseAction(courseId: string, actor: CourseActor) {
  return dbPublishCourse(courseId, actor)
}

export async function deleteCourseForActorAction(courseId: string, actor: CourseActor) {
  return dbDeleteCourseForActor(courseId, actor)
}

export async function updateLessonMediaAction(
  lessonId: string,
  media: { videoUrl?: string | null; resourceUrl?: string | null }
) {
  return dbUpdateLessonMedia(lessonId, media)
}

export async function updateCourseThumbnailAction(courseId: string, thumbnail: string, actor: CourseActor) {
  return dbUpdateCourseThumbnail(courseId, thumbnail, actor)
}

export async function createAdminNotificationAction(payload: {
  adminPhone?: string
  type: string
  message: string
  metadata?: unknown
}) {
  return dbCreateAdminNotification(payload)
}

export async function listAdminNotificationsAction(adminPhone: string) {
  return dbListAdminNotifications(adminPhone)
}

export async function markAdminNotificationReadAction(notificationId: string, adminPhone: string) {
  return dbMarkAdminNotificationRead(notificationId, adminPhone)
}

export async function getProductsAction() {
  return dbGetProducts()
}

export async function getUserAssetsAction(payload: AccessCheckPayload) {
  return dbGetUserAssets(payload)
}

export async function getManagedUsersAction(adminPhone: string) {
  return dbGetManagedUsers(adminPhone)
}

export async function upsertUserAction(payload: Partial<User>) {
  return dbUpsertUser(payload)
}

export async function deleteUserAction(userId: string, adminPhone: string) {
  return dbDeleteUser(userId, adminPhone)
}

export async function getTeamsAction(adminPhone: string) {
  return dbGetTeams(adminPhone)
}

export async function createTeamAction(payload: { name: string; adminPhone: string }) {
  return dbCreateTeam(payload)
}

export async function deleteTeamAction(teamId: string, adminPhone: string) {
  return dbDeleteTeam(teamId, adminPhone)
}

export async function getAdminProfileAction(phone: string) {
  return dbGetAdminProfile(phone)
}

export async function updateAdminProfileAction(payload: { phone: string; firstName: string; lastName: string }) {
  return dbUpdateAdminProfile(payload)
}

export async function submitPurchaseAction(payload: { productIds: string[]; adminPhone: string }) {
  return dbSubmitPurchase(payload)
}
