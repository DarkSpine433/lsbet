import { redirect } from 'next/navigation'

type Props = {}

const page = (props: Props) => {
  return redirect('/')
}

export default page
