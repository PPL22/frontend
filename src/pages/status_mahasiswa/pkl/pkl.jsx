import React from "react";
import {
  Spinner,
  Dropdown,
  PaginationPage,
} from "../../../components/components";
import config from "../../../configs/config.json";
import axios from "axios";
import TableStatusPKLMahasiswa from "./TableStatusPKLMahasiswa";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

function StatusPKLMahasiswa({
  isRekap = false,
  endpoint,
  updateRekapPage,
  pageRekap,
  totalPageRekap,
  updateLimitRekap,
}) {
  const auth = useAuth();
  const [dataPkl, setDataPkl] = React.useState({
    thead: [
      "No",
      "Nama Mahasiswa",
      "NIM",
      "Angkatan",
      "Semester",
      "Nilai PKL",
      "Action",
      "Status",
    ],
    tbody: [],
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPage, setTotalPage] = React.useState(10);
  const [limit, setLimit] = React.useState(5);
  const [orderBy, setOrderBy] = React.useState("nim");
  const [currentFilter, setCurrentFilter] = React.useState("nim");
  const [isAscending, setIsAscending] = React.useState(true);

  const updatePage = (value) => {
    setPage(value);
  };

  const updateLimit = (value) => {
    setLimit(value);
  };

  const getDataPkl = async () => {
    const apiUrl = config.API_URL;
    const token = localStorage.getItem("accessToken");
    try {
      const url = isRekap
        ? apiUrl + endpoint
        : `${apiUrl}/dosen/status-validasi/pkl`;
      const response = await axios.get(url, {
        params: {
          page: page,
          qty: limit,
          sortBy: orderBy,
          order: isAscending ? "asc" : "desc",
        },
        headers: {
          "x-access-token": token,
        },
      });
      let startNumber = (page - 1) * limit + 1;
      const result = response.data.data.pkl.map((item) => {
        return {
          data: [
            startNumber++,
            item.nama,
            item.nim,
            item.angkatan,
            item.semester,
            item.nilai,
          ],
          statusValidasi: item.statusValidasi,
          document: config.API_DOCUMENT_URL + "/pkl/" + item.filePkl,
        };
      });
      setDataPkl({
        ...dataPkl,
        tbody: result,
      });
      setTotalPage(response.data.data.maxPage);
    } catch (error) {
      if (error.response.status === 401) {
        auth.logout();
      }
      throw error;
    }
  };

  React.useEffect(() => {
    setIsLoading(true);
    getDataPkl();
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    getDataPkl();
  }, [page, limit, orderBy, isAscending]);

  const onClickHead = (value) => {
    let sorted = value.toLowerCase();
    if (sorted === "nama mahasiswa") {
      sorted = "nama";
    } else if (sorted === "nilai pkl") {
      sorted = "nilai";
    } else if (sorted === "status") {
      sorted = "statusValidasi";
    }
    if (sorted === orderBy) {
      setIsAscending(!isAscending);
    } else {
      setOrderBy(sorted);
      setIsAscending(true);
      setCurrentFilter(value);
    }
  };

  return isLoading ? (
    <div className="h-full flex justify-center items-center">
      <Spinner />
    </div>
  ) : (
    <section className="mt-10 px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Daftar Status PKL Mahasiswa</h2>
        {isRekap && (
          <Link to="#">
            <button className="border border-blue-500 hover:bg-blue-700 text-gray-900 hover:text-white font-bold py-2 px-4 rounded">
              Cetak
            </button>
          </Link>
        )}
      </div>
      <TableStatusPKLMahasiswa
        onClickHead={onClickHead}
        currentFilter={currentFilter}
        isRekap={isRekap}
        data={dataPkl}
        refreshData={getDataPkl}
      />
      <div className="flex justify-between mt-2">
        <Dropdown
          label={"Tampilkan per baris"}
          id="tampilkan"
          defaultValue={limit}
          onChange={
            isRekap
              ? (value) => updateLimitRekap(value)
              : (value) => updateLimit(value)
          }
          options={[
            { value: 5, label: "5 data" },
            { value: 10, label: "10 data" },
            { value: 50, label: "50 data" },
            { value: 100, label: "100 data" },
          ]}
        />
        {isRekap ? (
          <PaginationPage
            page={pageRekap}
            totalPage={totalPageRekap}
            updatePage={updateRekapPage}
          />
        ) : (
          <PaginationPage
            page={page}
            totalPage={totalPage}
            updatePage={updatePage}
          />
        )}
      </div>
    </section>
  );
}

export default StatusPKLMahasiswa;
