import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LargeLoaderComponent } from "src/app/loaders/large/large.component";
import { SmallLoaderComponent } from "src/app/loaders/small-loader/small-loader.component";

@NgModule({
  declarations: [LargeLoaderComponent, SmallLoaderComponent],
  imports: [CommonModule],
  exports: [LargeLoaderComponent, SmallLoaderComponent]
})
export class CoreModule {}
