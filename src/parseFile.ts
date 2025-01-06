import {read, utils} from "xlsx";

export const parseFile = (data: Uint8Array) => {
  const book = read(data, {type: 'array'});

  const readSheet = (name: string) => {
    const sheet = book.Sheets[name];
    const aoa = utils.sheet_to_json<any[]>(sheet, { header: 1 })

    return {
      columns: aoa[0],
      rows: aoa.slice(1)
    }
  };

  const sheetNames = book.SheetNames;
  return { sheetNames, readSheet };
}