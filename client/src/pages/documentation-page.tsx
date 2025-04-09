import { useState } from "react";
import { Link } from "wouter";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink, Code, BookOpen, Settings, Users, Pencil, Server, Database, Shield } from "lucide-react";

export default function DocumentationPage() {
  const [activeTab, setActiveTab] = useState("getting-started");
  
  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dokumentasi</h1>
        <p className="text-muted-foreground mt-2">
          Panduan lengkap dan referensi teknis untuk Web3 Project Catalog
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Side Navigation */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="sticky top-20">
            <div className="mb-4">
              <Button variant="outline" size="sm" asChild className="w-full justify-start">
                <Link href="/">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Kembali ke Beranda
                </Link>
              </Button>
            </div>

            <div className="space-y-1">
              <Button 
                variant={activeTab === "getting-started" ? "default" : "ghost"} 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setActiveTab("getting-started")}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Memulai
              </Button>
              <Button 
                variant={activeTab === "user-guide" ? "default" : "ghost"} 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setActiveTab("user-guide")}
              >
                <Users className="mr-2 h-4 w-4" />
                Panduan Pengguna
              </Button>
              <Button 
                variant={activeTab === "admin-guide" ? "default" : "ghost"} 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setActiveTab("admin-guide")}
              >
                <Settings className="mr-2 h-4 w-4" />
                Panduan Admin
              </Button>
              <Button 
                variant={activeTab === "api-reference" ? "default" : "ghost"} 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setActiveTab("api-reference")}
              >
                <Code className="mr-2 h-4 w-4" />
                Referensi API
              </Button>
              <Button 
                variant={activeTab === "technical" ? "default" : "ghost"} 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setActiveTab("technical")}
              >
                <Server className="mr-2 h-4 w-4" />
                Dokumentasi Teknis
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* Getting Started Tab */}
          {activeTab === "getting-started" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Memulai dengan Web3 Project Catalog</h2>
                <p className="text-muted-foreground">
                  Web3 Project Catalog adalah platform untuk menemukan, mengeksplorasi, dan membagikan 
                  proyek kripto dan blockchain. Berikut adalah cara memulai menggunakan platform ini.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Persyaratan Sistem</h3>
                <p>Agar dapat menjalankan aplikasi dengan optimal, pastikan Anda memiliki:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Browser Modern</strong> - Chrome, Firefox, Edge, atau Safari versi terbaru.
                  </li>
                  <li>
                    <strong>Koneksi Internet</strong> - Koneksi stabil untuk mengakses semua fitur.
                  </li>
                  <li>
                    <strong>Perangkat</strong> - Komputer, tablet, atau ponsel dengan layar yang cukup besar.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Cara Membuat Akun</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Kunjungi halaman beranda dan klik tombol "Masuk" di pojok kanan atas.</li>
                  <li>Klik tautan "Buat akun baru" di bawah form login.</li>
                  <li>Masukkan username, email, dan kata sandi yang diinginkan.</li>
                  <li>Klik tombol "Daftar" untuk menyelesaikan pendaftaran.</li>
                  <li>Login menggunakan kredensial yang telah dibuat.</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Mengajukan Proyek Baru</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Login ke akun Anda.</li>
                  <li>Klik tombol "Submit Project" di beranda atau navigasi.</li>
                  <li>Isi formulir dengan detail proyek Anda (nama, deskripsi, URL, kategori, dll).</li>
                  <li>Upload ikon proyek jika tersedia, atau gunakan ikon default.</li>
                  <li>Klik "Submit Project" untuk mengirim proyek Anda untuk ditinjau.</li>
                  <li>Tunggu hingga admin menyetujui proyek Anda.</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Menelusuri Katalog</h3>
                <p>Anda dapat menjelajahi proyek yang tersedia melalui beberapa cara:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Berdasarkan Kategori</strong> - Pilih kategori dari daftar kategori di beranda.
                  </li>
                  <li>
                    <strong>Proyek Terverifikasi</strong> - Lihat proyek-proyek dengan tanda verifikasi yang telah divalidasi oleh admin.
                  </li>
                  <li>
                    <strong>Proyek Populer</strong> - Lihat proyek-proyek yang sering dikunjungi.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">FAQ</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Berapa lama proses persetujuan proyek?</AccordionTrigger>
                    <AccordionContent>
                      Proses persetujuan biasanya membutuhkan waktu 1-3 hari kerja. Anda akan menerima
                      notifikasi via email saat proyek Anda disetujui atau ditolak.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Bagaimana cara mengedit proyek yang sudah diajukan?</AccordionTrigger>
                    <AccordionContent>
                      Anda dapat mengedit proyek melalui halaman profil. Klik tombol "Edit" pada proyek
                      yang ingin diubah. Perubahan mungkin memerlukan persetujuan admin kembali.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Apa itu status verifikasi proyek?</AccordionTrigger>
                    <AccordionContent>
                      Proyek terverifikasi telah melewati pemeriksaan tambahan untuk memastikan kredibilitas
                      dan kualitasnya. Proyek dengan tanda centang biru telah diverifikasi oleh tim kami.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>Bagaimana cara mengubah informasi profil?</AccordionTrigger>
                    <AccordionContent>
                      Kunjungi halaman profil Anda melalui menu dropdown di pojok kanan atas, lalu klik
                      tombol "Edit Profile". Di sana Anda dapat memperbarui nama, avatar, dan informasi lainnya.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          )}

          {/* User Guide Tab */}
          {activeTab === "user-guide" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Panduan Pengguna</h2>
                <p className="text-muted-foreground">
                  Petunjuk lengkap tentang cara menggunakan semua fitur platform sebagai pengguna biasa.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Mengelola Profil</h3>
                <p>Anda dapat menyesuaikan dan mengatur profil pribadi Anda:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    <strong>Upload Avatar</strong> - Klik pada tombol "Edit Profile" di halaman profil
                    lalu pilih avatar baru dari perangkat Anda.
                  </li>
                  <li>
                    <strong>Edit Nama Pengguna</strong> - Ubah nama pengguna Anda dari halaman edit profil.
                  </li>
                  <li>
                    <strong>Ubah Password</strong> - Pilih opsi "Change Password" untuk memperbarui password Anda.
                  </li>
                  <li>
                    <strong>Tambahkan Bio</strong> - Masukkan informasi tentang diri Anda di formulir edit profil.
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Mengelola Proyek</h3>
                <p>Sebagai pengguna, Anda dapat mengelola proyek-proyek yang telah Anda ajukan:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Melihat Status</strong> - Lihat status persetujuan proyek Anda di tab "My Projects" 
                    pada halaman profil.
                  </li>
                  <li>
                    <strong>Edit Proyek</strong> - Klik tombol "Edit" pada proyek yang ingin diubah 
                    untuk memperbarui informasi.
                  </li>
                  <li>
                    <strong>Memperbarui Ikon</strong> - Ganti ikon proyek dari halaman edit proyek.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Menelusuri Proyek</h3>
                <p>Ada beberapa cara untuk menemukan proyek dalam katalog:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Kategori</strong> - Gunakan tab kategori untuk melihat proyek berdasarkan tipe.
                  </li>
                  <li>
                    <strong>Filter Status</strong> - Filter untuk hanya melihat proyek terverifikasi.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Tips Pengajuan Proyek</h3>
                <p>Untuk meningkatkan kemungkinan proyek Anda disetujui dan terverifikasi:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Deskripsi Jelas</strong> - Berikan deskripsi singkat namun informatif tentang proyek Anda.
                  </li>
                  <li>
                    <strong>URL Valid</strong> - Pastikan URL website proyek Anda berfungsi dan dapat diakses.
                  </li>
                  <li>
                    <strong>Ikon Berkualitas</strong> - Upload ikon dengan resolusi baik (ukuran yang disarankan: 60x60px).
                  </li>
                  <li>
                    <strong>Pilih Kategori dengan Tepat</strong> - Masukkan proyek Anda ke dalam kategori yang paling sesuai.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Admin Guide Tab */}
          {activeTab === "admin-guide" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Panduan Administrator</h2>
                <p className="text-muted-foreground">
                  Petunjuk komprehensif untuk administrator platform dalam mengelola katalog.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Akses Panel Admin</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Login dengan akun administrator.</li>
                  <li>Klik tautan "Admin Panel" di menu dropdown profil.</li>
                  <li>Panel admin memiliki beberapa tab fungsional untuk tugas administrasi yang berbeda.</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Mengelola Pengajuan Proyek</h3>
                <p>Sebagai admin, Anda bertanggung jawab untuk mereview dan menyetujui proyek yang diajukan:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    <strong>Review Proyek</strong> - Akses tab "Pending Projects" untuk melihat proyek yang menunggu persetujuan.
                  </li>
                  <li>
                    <strong>Verifikasi Detail</strong> - Periksa nama, deskripsi, URL, dan kategori untuk memastikan keakuratan.
                  </li>
                  <li>
                    <strong>Approve/Reject</strong> - Gunakan tombol "Approve" untuk menyetujui atau "Reject" untuk menolak proyek.
                  </li>
                  <li>
                    <strong>Verifikasi Proyek</strong> - Untuk proyek berkualitas tinggi, berikan badge verifikasi menggunakan tombol "Verification".
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Mengelola Kategori</h3>
                <p>Admin dapat menambah, mengedit, atau menghapus kategori proyek:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    <strong>Tambah Kategori</strong> - Di tab "Categories", masukkan nama dan slug kategori baru, lalu klik "Add Category".
                  </li>
                  <li>
                    <strong>Edit Kategori</strong> - Klik pada kategori yang ada, update informasi, lalu klik "Save Changes".
                  </li>
                  <li>
                    <strong>Hapus Kategori</strong> - Klik tombol "Delete" pada kategori yang ingin dihapus.
                  </li>
                </ol>
                <p><strong>Catatan:</strong> Menghapus kategori akan mempengaruhi proyek yang saat ini menggunakan kategori tersebut.</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Konfigurasi Situs</h3>
                <p>Customize pengaturan situs keseluruhan:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Ganti Nama Situs</strong> - Ubah nama situs yang ditampilkan di header.
                  </li>
                  <li>
                    <strong>Update Logo</strong> - Upload logo baru untuk brand.
                  </li>
                  <li>
                    <strong>Ubah Teks Footer</strong> - Kustomisasi teks copyright dan informasi footer.
                  </li>
                  <li>
                    <strong>Set Warna Tema</strong> - Pilih warna primer untuk situs.
                  </li>
                  <li>
                    <strong>Tentukan Icon Default</strong> - Upload icon default yang akan digunakan untuk proyek tanpa ikon kustom.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Praktik Terbaik Administrasi</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Konsistensi</strong> - Terapkan standar yang sama untuk semua pengajuan proyek.
                  </li>
                  <li>
                    <strong>Verifikasi Secara Selektif</strong> - Berikan badge verifikasi hanya untuk proyek berkualitas tinggi yang telah diverifikasi keabsahannya.
                  </li>
                  <li>
                    <strong>Backup Reguler</strong> - Backup database secara berkala untuk mencegah kehilangan data.
                  </li>
                  <li>
                    <strong>Pantau Aktivitas</strong> - Periksa panel admin secara berkala untuk pengajuan proyek baru.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* API Reference Tab */}
          {activeTab === "api-reference" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Referensi API</h2>
                <p className="text-muted-foreground">
                  Dokumentasi lengkap tentang API Web3 Project Catalog yang tersedia untuk pengembang.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Endpoint API</h3>
                <p>Berikut adalah endpoint API utama yang tersedia:</p>

                <div className="mt-6 space-y-8">
                  {/* Projects API */}
                  <div className="rounded-lg border">
                    <div className="flex items-center p-4 border-b bg-muted/50">
                      <h4 className="text-lg font-medium">Projects API</h4>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                          <span className="ml-2 font-mono text-sm">/api/projects</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Mendapatkan daftar proyek yang disetujui.</p>
                        <div className="text-xs">
                          <strong>Response:</strong> <span className="font-mono">Array&lt;Project&gt;</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                          <span className="ml-2 font-mono text-sm">/api/projects/:id</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Mendapatkan detail proyek berdasarkan ID.</p>
                        <div className="text-xs">
                          <strong>Response:</strong> <span className="font-mono">Project</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                          <span className="ml-2 font-mono text-sm">/api/projects</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Membuat proyek baru (memerlukan autentikasi).</p>
                        <div className="text-xs">
                          <strong>Body:</strong> <span className="font-mono">ProjectInput</span><br />
                          <strong>Response:</strong> <span className="font-mono">Project</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">PATCH</span>
                          <span className="ml-2 font-mono text-sm">/api/projects/:id</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Memperbarui proyek yang ada (memerlukan autentikasi).</p>
                        <div className="text-xs">
                          <strong>Body:</strong> <span className="font-mono">Partial&lt;ProjectInput&gt;</span><br />
                          <strong>Response:</strong> <span className="font-mono">Project</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categories API */}
                  <div className="rounded-lg border">
                    <div className="flex items-center p-4 border-b bg-muted/50">
                      <h4 className="text-lg font-medium">Categories API</h4>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                          <span className="ml-2 font-mono text-sm">/api/categories</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Mendapatkan daftar semua kategori.</p>
                        <div className="text-xs">
                          <strong>Response:</strong> <span className="font-mono">Array&lt;Category&gt;</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                          <span className="ml-2 font-mono text-sm">/api/categories/:slug</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Mendapatkan kategori berdasarkan slug.</p>
                        <div className="text-xs">
                          <strong>Response:</strong> <span className="font-mono">Category</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User API */}
                  <div className="rounded-lg border">
                    <div className="flex items-center p-4 border-b bg-muted/50">
                      <h4 className="text-lg font-medium">User API</h4>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                          <span className="ml-2 font-mono text-sm">/api/user</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Mendapatkan informasi user yang sedang login.</p>
                        <div className="text-xs">
                          <strong>Response:</strong> <span className="font-mono">User</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                          <span className="ml-2 font-mono text-sm">/api/user/projects</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Mendapatkan proyek milik user saat ini.</p>
                        <div className="text-xs">
                          <strong>Response:</strong> <span className="font-mono">Array&lt;Project&gt;</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">PATCH</span>
                          <span className="ml-2 font-mono text-sm">/api/user</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Memperbarui profil user.</p>
                        <div className="text-xs">
                          <strong>Body:</strong> <span className="font-mono">Partial&lt;UserUpdateInput&gt;</span><br />
                          <strong>Response:</strong> <span className="font-mono">User</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin API */}
                  <div className="rounded-lg border">
                    <div className="flex items-center p-4 border-b bg-muted/50">
                      <h4 className="text-lg font-medium">Admin API</h4>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">GET</span>
                          <span className="ml-2 font-mono text-sm">/api/admin/projects/pending</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Mendapatkan daftar proyek yang menunggu persetujuan.</p>
                        <div className="text-xs">
                          <strong>Response:</strong> <span className="font-mono">Array&lt;Project&gt;</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                          <span className="ml-2 font-mono text-sm">/api/admin/projects/:id/approve</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Menyetujui proyek yang tertunda.</p>
                        <div className="text-xs">
                          <strong>Response:</strong> <span className="font-mono">Project</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                          <span className="ml-2 font-mono text-sm">/api/admin/projects/:id/reject</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Menolak proyek yang tertunda.</p>
                        <div className="text-xs">
                          <strong>Response:</strong> <span className="font-mono">Project</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">POST</span>
                          <span className="ml-2 font-mono text-sm">/api/admin/projects/:id/verify</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Memverifikasi proyek yang disetujui.</p>
                        <div className="text-xs">
                          <strong>Response:</strong> <span className="font-mono">Project</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Model Data</h3>
                <p>Berikut adalah skema data utama yang digunakan dalam API:</p>

                <div className="mt-4 space-y-6">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 p-3 border-b">
                      <h4 className="font-mono font-medium">Project</h4>
                    </div>
                    <div className="p-4">
                      <pre className="text-xs overflow-auto font-mono p-2 bg-muted/40 rounded">
{`{
  id: number;
  name: string;
  description: string;
  websiteUrl: string;
  iconUrl?: string;
  category: string;
  userId: number;
  approved: boolean;
  pending: boolean;
  verified: boolean;
  createdAt: string;
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 p-3 border-b">
                      <h4 className="font-mono font-medium">Category</h4>
                    </div>
                    <div className="p-4">
                      <pre className="text-xs overflow-auto font-mono p-2 bg-muted/40 rounded">
{`{
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 p-3 border-b">
                      <h4 className="font-mono font-medium">User</h4>
                    </div>
                    <div className="p-4">
                      <pre className="text-xs overflow-auto font-mono p-2 bg-muted/40 rounded">
{`{
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 p-3 border-b">
                      <h4 className="font-mono font-medium">SiteSettings</h4>
                    </div>
                    <div className="p-4">
                      <pre className="text-xs overflow-auto font-mono p-2 bg-muted/40 rounded">
{`{
  id: number;
  siteName: string;
  logoUrl: string;
  primaryColor: string;
  footerText: string;
  defaultProjectIcon: string;
  createdAt: string;
  updatedAt: string;
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Technical Documentation Tab */}
          {activeTab === "technical" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Dokumentasi Teknis</h2>
                <p className="text-muted-foreground">
                  Panduan teknis untuk pengembang yang ingin memahami atau mengembangkan platform.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Arsitektur Sistem</h3>
                <p>Aplikasi Web3 Project Catalog menggunakan arsitektur client-server dengan struktur berikut:</p>
                
                <div className="mt-4">
                  <img 
                    src="https://via.placeholder.com/800x400?text=Architecture+Diagram" 
                    alt="Architecture Diagram" 
                    className="w-full rounded-lg border"
                  />
                </div>

                <h4 className="text-lg font-medium mt-6">Komponen Utama:</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Frontend (React)</strong> - Interface pengguna yang dibangun dengan React, Shadcn UI, dan TailwindCSS.
                  </li>
                  <li>
                    <strong>Backend (Express)</strong> - Server API RESTful menggunakan Express.js.
                  </li>
                  <li>
                    <strong>Database</strong> - PostgreSQL dengan Drizzle ORM untuk manajemen data.
                  </li>
                  <li>
                    <strong>Authentication</strong> - Sistem autentikasi berbasis session menggunakan Passport.js.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Struktur Database</h3>
                <p>Skema database utama didefinisikan menggunakan Drizzle ORM:</p>
                
                <div className="space-y-4 mt-4">
                  <h4 className="text-lg font-medium">Tabel Users</h4>
                  <pre className="text-xs overflow-auto font-mono p-3 bg-muted/40 rounded">
{`export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});`}
                  </pre>

                  <h4 className="text-lg font-medium">Tabel Projects</h4>
                  <pre className="text-xs overflow-auto font-mono p-3 bg-muted/40 rounded">
{`export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  websiteUrl: text("website_url").notNull(),
  iconUrl: text("icon_url"),
  category: text("category").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  approved: boolean("approved").default(false),
  pending: boolean("pending").default(true),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});`}
                  </pre>

                  <h4 className="text-lg font-medium">Tabel Categories</h4>
                  <pre className="text-xs overflow-auto font-mono p-3 bg-muted/40 rounded">
{`export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});`}
                  </pre>

                  <h4 className="text-lg font-medium">Tabel Site Settings</h4>
                  <pre className="text-xs overflow-auto font-mono p-3 bg-muted/40 rounded">
{`export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").default("Web3 Project"),
  logoUrl: text("logo_url").default(""),
  primaryColor: text("primary_color").default("#3B82F6"),
  footerText: text("footer_text").default("© 2025 Web3 Project. All Rights Reserved."),
  defaultProjectIcon: text("default_project_icon").default(""),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});`}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Alur Autentikasi</h3>
                <p>Autentikasi menggunakan strategi Passport Local dengan alur sebagai berikut:</p>

                <ol className="list-decimal pl-6 space-y-2 mt-4">
                  <li>User memasukkan credentials (email/password) di form login.</li>
                  <li>Request dikirim ke endpoint <code>/api/auth/login</code>.</li>
                  <li>Passport.js memverifikasi credentials dengan membandingkan password yang di-hash.</li>
                  <li>Setelah berhasil, session dibuat dan ID user disimpan dalam session.</li>
                  <li>User diarahkan ke halaman sesuai status (admin/pengguna biasa).</li>
                </ol>

                <h4 className="text-lg font-medium mt-6">Middleware Autentikasi</h4>
                <pre className="text-xs overflow-auto font-mono p-3 bg-muted/40 rounded">
{`// Middleware untuk memastikan user sudah login
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
}

// Middleware untuk memastikan user adalah admin
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
}`}
                </pre>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Workflow Submit Project</h3>
                <p>Berikut adalah langkah-langkah teknis bagaimana proyek diajukan dan diproses:</p>

                <ol className="list-decimal pl-6 space-y-2 mt-4">
                  <li>User mengisi formulir proyek (name, description, websiteUrl, category, dll).</li>
                  <li>Jika icon diupload, file dikonversi ke base64 dan disimpan sebagai string di database.</li>
                  <li>Data divalidasi menggunakan skema Zod di client dan server.</li>
                  <li>Proyek disimpan dengan status <code>pending: true</code> dan <code>approved: false</code>.</li>
                  <li>Admin mereview proyek di panel admin.</li>
                  <li>Saat disetujui, status diubah menjadi <code>pending: false</code> dan <code>approved: true</code>.</li>
                  <li>Proyek yang disetujui muncul di katalog publik.</li>
                </ol>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Deployment dan Hosting</h3>
                <p>Aplikasi ini dapat di-deploy ke berbagai platform hosting:</p>

                <h4 className="text-lg font-medium mt-4">Persyaratan Deployment</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Node.js runtime (v18+ disarankan)</li>
                  <li>PostgreSQL database (v14+ disarankan)</li>
                  <li>Koneksi HTTPS untuk keamanan</li>
                </ul>

                <h4 className="text-lg font-medium mt-4">Environment Variables</h4>
                <p>Konfigurasi berikut diperlukan untuk deployment:</p>
                <pre className="text-xs overflow-auto font-mono p-3 bg-muted/40 rounded">
{`DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your_random_session_secret
PORT=5000
NODE_ENV=production`}
                </pre>
              </div>

              <div className="space-y-4 mt-4">
                <h3 className="text-xl font-semibold">Pemeliharaan dan Backup</h3>
                <p>Panduan untuk pemeliharaan sistem:</p>

                <h4 className="text-lg font-medium mt-4">Database Backup</h4>
                <pre className="text-xs overflow-auto font-mono p-3 bg-muted/40 rounded">
{`# Export database
pg_dump -U username -d database_name > backup_$(date +%Y%m%d).sql

# Import database
psql -U username -d database_name < backup_file.sql`}
                </pre>

                <h4 className="text-lg font-medium mt-4">Log Rotation</h4>
                <p>Implementasikan log rotation untuk mencegah file log menjadi terlalu besar:</p>
                <pre className="text-xs overflow-auto font-mono p-3 bg-muted/40 rounded">
{`// Contoh konfigurasi winston logger dengan rotasi
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});`}
                </pre>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Link>
            </Button>
            <a 
              href="https://github.com/yourusername/webapp" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <Code className="mr-2 h-4 w-4" />
              Source Code
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}