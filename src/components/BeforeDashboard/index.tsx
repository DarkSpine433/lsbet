import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to your LSBet admin dashboard!</h4>
      </Banner>
      <p className={`${baseClass}__description`}>
        This is the admin dashboard for LSBet. Here you can manage your content, users, and
        settings.
      </p>
    </div>
  )
}

export default BeforeDashboard
