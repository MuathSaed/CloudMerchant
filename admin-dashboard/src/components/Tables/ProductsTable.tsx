import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTable, usePagination, useSortBy, Column, TableInstance, Row, CellProps } from 'react-table';
import { Product } from '../../pages/Products'; 
import { AiOutlineArrowUp, AiOutlineArrowDown, AiOutlineArrowDown as ArrowUpDown, AiOutlineDelete as Trash, AiOutlineLeft, AiOutlineDoubleLeft, AiOutlineRight, AiOutlineDoubleRight } from 'react-icons/ai';

interface ProductsTableProps {
  products: Product[];
  onDelete: (productId: string) => void;
}

let ProductsTable: React.FC<ProductsTableProps> = ({ products, onDelete }) => {
  let columns: Column<Product>[] = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'ID',
        accessor: 'id',
      },
      {
        Header: 'Category',
        accessor: 'category',
      },
      {
        Header: 'Price',
        accessor: 'price',
        Cell: ({ value }: CellProps<Product, number>) => (
          <>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}</>
        ),
      },
      {
        Header: 'Quantity',
        accessor: 'quantity',
      },
      {
        Header: 'Thumbnail',
        accessor: 'thumbnail',
        Cell: ({ value }) => (
          <img
            src={value}
            alt="Product"
            className="h-12 w-16 object-cover rounded"
          />
        ),
      }, 
      {
        Header: 'Actions',
        id: 'actions', 
        Cell: ({ row }: { row: Row<Product> }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this product?')) {
                  onDelete(row.original.id);
                }
              }} 
              className="text-red-500 hover:text-red-700" 
            >
              <Trash /> 
            </button>
          </div>
        ),
      }, 
    ],
    [onDelete]
  ); 

  let tableInstance = useTable({
    columns,
    data: products,
    initialState: {},
  }, useSortBy, usePagination) as TableInstance<Product> & { 
    page: Row<Product>[];
    canPreviousPage: boolean;
    canNextPage: boolean;
    pageOptions: any[];
    pageCount: number;
    gotoPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
    setPageSize: (pageSize: number) => void;
    state: {
      pageIndex: number;
      pageSize: number;
    };
  };

  let {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, 
    canPreviousPage,
    canNextPage, 
    pageOptions, 
    pageCount, 
    gotoPage,
    nextPage,
    previousPage,
    setPageSize, 
    state: { pageIndex, pageSize }, 
  } = tableInstance;

  return (
    <>
      <table {...getTableProps()} className="min-w-full divide-y divide-gray-200 table-fixed"> 
        <thead className="bg-gray-50"> 
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
              {headerGroup.headers.map((column: any) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  key={column.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.render('Header')}
                  {column.isSorted ? (
                    column.isSortedDesc ? (
                      <AiOutlineArrowDown className="inline-block ml-1 w-3 h-3" />
                    ) : (
                      <AiOutlineArrowUp className="inline-block ml-1 w-3 h-3" />
                    )
                  ) : (
                    <ArrowUpDown className="inline-block ml-1 w-3 h-3 opacity-0" />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200"> 
          {page.map((row) => { 
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id}> 
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()} 
                    key={cell.column.id}
                    className="px-6 py-4 whitespace-nowrap"
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex flex-col md:flex-row items-center justify-between mt-4">
        <div className="flex items-center">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="form-select block w-full -ml-1"
          >
            {[10, 25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex mt-2 md:mt-0">
          <button
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Previous</span>
            <AiOutlineDoubleLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Previous</span>
            <AiOutlineLeft className="w-5 h-5" />
          </button>

          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            Page {pageIndex + 1} of {pageOptions.length}
          </span>

          <button
            onClick={() => nextPage()}
            disabled={!canNextPage}
            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Next</span>
            <AiOutlineRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Next</span>
            <AiOutlineDoubleRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductsTable;
