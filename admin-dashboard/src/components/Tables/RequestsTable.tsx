import React, { useMemo } from 'react';
import { useTable, usePagination, useSortBy, Column, TableInstance, Row, CellProps } from 'react-table';
import { User } from '../../pages/Requests';
import { AiOutlineArrowUp, AiOutlineArrowDown, AiOutlineArrowDown as ArrowUpDown, AiOutlineDelete as Trash, AiOutlineLeft, AiOutlineDoubleLeft, AiOutlineRight, AiOutlineDoubleRight } from 'react-icons/ai';

interface RequestsTableProps {
  users: User[];
  onApprove: (userId: string) => void;
}

let RequestsTable: React.FC<RequestsTableProps> = ({ users, onApprove }) => {
  let columns: Column<User>[] = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Role',
        accessor: 'role',
      },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ value }: CellProps<User, string>) => {
          if (value) return <>{value}</>;
          return null;
        },
      },
      {
        Header: 'Image',
        accessor: 'image',
        Cell: ({ value }: CellProps<User, string>) => {
          if (value) {
            return (
              <img
                src={Object.values(value)[0]}
                className="h-12 w-16 object-cover rounded"
              />
            );
          }
          return null;
        }
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        Cell: ({ value }: CellProps<User, string>) => {
          let date = new Date(value);
          return (
            <>{date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</>
          );
        },
      },
      {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }: { row: Row<User> }) => (
          <div>
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to approve this user?')) {
                  onApprove(row.original._id);
                }
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
              Approve
            </button> 
          </div>
        ),
      },
    ],
    [onApprove]
  );

  let tableInstance = useTable({
    columns,
    data: users,
    initialState: {},
  }, useSortBy, usePagination) as TableInstance<User> & { 
    page: Row<User>[];
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
      <table
        {...getTableProps()}
        className="min-w-full divide-y divide-gray-200 table-fixed"
      >
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

      {/* Pagination controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-4">
        <div className="flex items-center">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
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
            <span className="sr-only">First</span>
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
            <span className="sr-only">Last</span>
            <AiOutlineDoubleRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default RequestsTable;
