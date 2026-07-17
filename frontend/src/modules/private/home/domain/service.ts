import { tryDomainTask } from "@/common/domain/try"
import repository from "./repository"

class HomeService {

    async testHttp() {
        return tryDomainTask<{student:{name:'andres'}}>(async () => {
          return await repository.testHttp()
        })
      }
}

export default new HomeService()
