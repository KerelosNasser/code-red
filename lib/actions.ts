"use server"

export type { User, Team, AdminProfile, AccessCheckPayload, ServiceResponse, AccessCheckData } from "./db/services"

import {
  checkUserAccess as dbCheckUserAccess,
  getCourses as dbGetCourses,
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
  type User
} from "./db/services"

export async function checkUserAccessAction(payload: AccessCheckPayload) {
  return dbCheckUserAccess(payload)
}

export async function getCoursesAction() {
  return dbGetCourses()
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
