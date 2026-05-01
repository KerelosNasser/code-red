import { getCoursesFromGas, getProductsFromGas } from "./api-client";

export async function getCachedCourses() {
  "use cache";
  return getCoursesFromGas();
}

export async function getCachedProducts() {
  "use cache";
  return getProductsFromGas();
}
