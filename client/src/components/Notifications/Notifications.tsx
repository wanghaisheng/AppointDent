import { createSignal, onCleanup, type JSX, createEffect } from 'solid-js'
import NotificationsList from './NotificationList'
import { type NotificationData } from './types'
import { Api } from '../../utils/api'

export default function Notifications (): JSX.Element {
  const [notifications, setNotifications] = createSignal<NotificationData[]>([])

  createEffect(async () => {
    await fetchNotifications()
    localStorage.setItem('counter', '0')
  })

  /**
   * Get the current logged in user's email.
   * @returns Current user email (string)
   */
  async function getEmail (): Promise<string> {
    const notificationResponse = await Api.get('sessions/whois', { withCredentials: true })
    return notificationResponse.data.email
  }

  // Function to fetch notifications from the server
  const fetchNotifications = async (): Promise<void> => {
    try {
      const userEmail = await getEmail()
      const response = await Api.get(`notifications/${userEmail}`, { withCredentials: true })
      const notificationData = response.data

      notificationData.sort((a: { timestamp: number }, b: { timestamp: number }) => b.timestamp - a.timestamp)

      setNotifications(notificationData)
    } catch (error) {
      console.error('Error fetching or setting notifications:', error)
      throw new Error('Error fetching the notifications')
    }
  }

  // Cleanup function to reset notifications
  onCleanup(() => {
    setNotifications([])
  })

  // Render the Notifications component
  return (
    <div class="h-full w-full flex flex-col justify-start align-left mt-4">
      <h1 class="text-2xl font-bold pl-10 mt-6 mb-4">Notifications</h1>
      <NotificationsList notifications={notifications()} />
    </div>
  )
}
