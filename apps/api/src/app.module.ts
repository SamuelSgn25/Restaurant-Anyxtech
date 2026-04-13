import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './config/database.config';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataModule } from './data/data.module';
import { EventsModule } from './events/events.module';
import { KitchenModule } from './kitchen/kitchen.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ReservationsModule } from './reservations/reservations.module';
import { SettingsModule } from './settings/settings.module';
import { StaffModule } from './staff/staff.module';
import { TablesModule } from './tables/tables.module';

const databaseModule =
  process.env.ENABLE_DB === 'true'
    ? [
        TypeOrmModule.forRootAsync({
          useFactory: databaseConfig
        })
      ]
    : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    ...databaseModule,
    DataModule,
    AuthModule,
    SettingsModule,
    MenuModule,
    EventsModule,
    ReservationsModule,
    OrdersModule,
    KitchenModule,
    PaymentsModule,
    DashboardModule,
    StaffModule,
    TablesModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ]
})
export class AppModule {}
