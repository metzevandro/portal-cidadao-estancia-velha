"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  AppShell,
  SideBar,
  SidebarTitle,
  SidebarItem,
  Header,
  HeaderProfile,
  Dropdown,
  DropdownItem,
  DropdownTitle,
  Button,
  Breadcrumb,
} from "design-system-zeroz";

import ModalLogin from "@/components/modalLogin/modalLogin";
import ModalCriarConta from "@/components/modalCriarConta/modalCriarConta";
import { auth } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signOut,
  User,
  getIdTokenResult,
} from "firebase/auth";
import { UserContext } from "./_context";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      try {
        const idToken = await getIdTokenResult(currentUser, true);
        const roleClaim = idToken.claims?.role;
        const adminFlag = idToken.claims?.admin;

        setIsAdmin(roleClaim === "admin" || adminFlag === true);
      } catch (error) {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleSidebar = () => setToggleSidebar(!toggleSidebar);

  const breadcrumb = useMemo(() => {
    if (pathname === "/") {
      return <Breadcrumb items={[{ pageName: "Página Inicial", href: "/" }]} />;
    }
    const segments = pathname.split("/").filter(Boolean);
    const items = segments.map((segment, index) => ({
      pageName: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: "/" + segments.slice(0, index + 1).join("/"),
    }));
    items.unshift({ pageName: "Página Inicial", href: "/" });
    return <Breadcrumb items={items} />;
  }, [pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <>
      <AppShell>
        <Header onClick={handleToggleSidebar} breadcrumb={breadcrumb}>
          {user ? (
            <HeaderProfile
              name={user.displayName || "Usuário"}
              letter={user.displayName || "Usuário"}
            >
              <Dropdown dropdown>
                <DropdownTitle content="Configurações" />
                <DropdownItem
                  typeIcon="logout"
                  content="Sair"
                  onClick={handleLogout}
                />
              </Dropdown>
            </HeaderProfile>
          ) : (
            <div style={{ display: "flex", gap: "var(--s-spacing-xx-small)" }}>
              <Button
                size="md"
                variant="secondary"
                onClick={() => setIsLoginOpen(true)}
              >
                Login
              </Button>
              <Button
                size="md"
                variant="primary"
                onClick={() => setIsCreateAccountOpen(true)}
              >
                Criar Conta
              </Button>
            </div>
          )}
        </Header>

        <SideBar
          toggle={toggleSidebar}
          brand="/logo.png"
          brandSize="lg"
          setToggleSidebar={handleToggleSidebar}
        >
          <SidebarTitle title="Geral" />
          <SidebarItem
            title="Página Inicial"
            icon="home"
            fillIcon
            onClick={() => router.push("/")}
            isActive={pathname === "/"}
          />

          <SidebarTitle title="Solicitações" />
          <SidebarItem
            title="Visão Geral"
            icon="dashboard"
            fillIcon
            onClick={() => router.push("/dashboard")}
            isActive={pathname === "/dashboard"}
          />
          <SidebarItem
            title="Minhas Solicitações"
            icon="library_books"
            fillIcon={false}
            onClick={() => router.push("/minhas-solicitacoes")}
            isActive={pathname === "/minhas-solicitacoes"}
          />

          {isAdmin && (
            <>
              <SidebarTitle title="Admin" />
              <SidebarItem
                title="Tipos de Solicitações"
                icon="folder_open"
                fillIcon={false}
                onClick={() => router.push("/tipos-de-solicitacoes")}
                isActive={pathname === "/tipos-de-solicitacoes"}
              />
              <SidebarItem
                title="Gerenciar Solicitações"
                icon="account_tree"
                fillIcon={false}
                onClick={() => router.push("/gerenciar-solicitacoes")}
                isActive={pathname === "/gerenciar-solicitacoes"}
              />
            </>
          )}
        </SideBar>

        <UserContext.Provider value={{ user, isAdmin }}>
          {children}
        </UserContext.Provider>
      </AppShell>

      <ModalLogin
        openCriarConta={() => setIsCreateAccountOpen(true)}
        hideModal={() => setIsLoginOpen(false)}
        isOpen={isLoginOpen}
      />

      <ModalCriarConta
        openLogin={() => setIsLoginOpen(true)}
        hideModal={() => setIsCreateAccountOpen(false)}
        isOpen={isCreateAccountOpen}
      />
    </>
  );
}
