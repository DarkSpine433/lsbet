import Image from 'next/image'
type Props = {}

const Icon = (props: Props) => {
  return (
    <img
      src="https://ut91p27j9t.ufs.sh/f/CI2WZ5YUTq1beVeh3Fwfw9glnXS4C6WAJcNBbrvIad7PD2yU"
      alt="logo"
      width={100}
      height={100}
      style={{
        borderRadius: '100%',
        scale: '1.2',
        objectFit: 'cover',
      }}
      className="size-10 lg:size-12  object-cover "
    />
  )
}

export default Icon
