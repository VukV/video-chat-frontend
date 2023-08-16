import {User} from "./user";

export interface UserSearch {
  content: User[],
  pageable: Pageable,
  totalElements: number,
  totalPages: number,
  size: number,
  numberOfElements: number
}

export interface Pageable {
  pageNumber: number,
  pageSize: number
}
