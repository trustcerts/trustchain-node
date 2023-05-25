import { Module } from '@nestjs/common';
import { ObserverVisualRepresentationController } from './observer-visual-representation.controller';
import { VisualRepresentationCachedModule } from '@tc/transactions/did-visual-representation/cached/visual-representation-cached.module';

@Module({
  imports: [VisualRepresentationCachedModule],
  controllers: [ObserverVisualRepresentationController],
})
export class ObserverVisualRepresentationModule {}
