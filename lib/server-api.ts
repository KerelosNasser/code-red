import { getCoursesAction, getProductsAction } from "./actions";

export async function getCachedCourses() {
  "use cache";
  return getCoursesAction();
}

export async function getCachedProducts() {
  "use cache";
  return getProductsAction();
}
