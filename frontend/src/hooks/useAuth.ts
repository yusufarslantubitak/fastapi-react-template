import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import {
  type Body_login_login_access_token as AccessToken,
  LoginService,
  type UserPublic,
  type UserRegister,
  UsersService,
} from "@/client"
import { useAuthStore } from "@/store/useAuthStore"
import { handleError } from "@/utils"
import useCustomToast from "./useCustomToast"

export const getAuthUser = async (): Promise<UserPublic> => {
  const storeUser = useAuthStore.getState().user
  if (storeUser) {
    return storeUser
  }

  try {
    const user = await UsersService.readUserMe()
    useAuthStore.getState().setUser(user)
    return user
  } catch (error) {
    useAuthStore.getState().setUser(null)
    throw error
  }
}

const useAuth = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { showErrorToast } = useCustomToast()

  const storeUser = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const isAuthRoute = ["/login", "/signup"].includes(location.pathname)

  const { data: user } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    enabled: !isAuthRoute,
    initialData: () => useAuthStore.getState().user || undefined,
  })

  useEffect(() => {
    if (user !== undefined) {
      setUser(user)
    }
  }, [user, setUser])

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),
    onSuccess: () => {
      navigate({ to: "/login" })
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const login = async (data: AccessToken) => {
    await LoginService.loginAccessToken({
      formData: data,
    })
    const user = await UsersService.readUserMe()
    setUser(user)
    queryClient.setQueryData(["currentUser"], user)
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate({ to: "/" })
    },
    onError: handleError.bind(showErrorToast),
  })

  const logout = async () => {
    try {
      await LoginService.logout()
    } catch (error) {
      console.error("Error logging out", error)
    }
    setUser(null)
    queryClient.setQueryData(["currentUser"], null)
    localStorage.removeItem("logged_in")
    navigate({ to: "/login" })
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    user: storeUser,
  }
}

export default useAuth
