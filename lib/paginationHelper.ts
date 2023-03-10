// https://github.com/supabase/supabase/discussions/1223#discussioncomment-641447
export function getPagination(page: number, pageSize: number) {
  const limit = pageSize ? + pageSize : 25;
  const from = page ? page * limit : 0;
  const to = page ? from + pageSize - 1 : pageSize - 1;

  return { from, to };
}
