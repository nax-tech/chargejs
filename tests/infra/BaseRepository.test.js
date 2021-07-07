/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

// Test framework imports
import chai from 'chai'
import sinon from 'sinon'
import chaiEvents from 'chai-events'
import sinonChai from 'sinon-chai'
import faker from 'faker'

// Fixtures and Helpers
import TransactionProviderStub from 'tests/fixtures/functions/infra/transaction/TransactionProviderStub'
import RedisRepositoryStub from 'tests/fixtures/functions/infra/redis/RedisRepositoryStub'
import calculateLimitAndOffsetStub from 'tests/fixtures/functions/infra/calculateLimitAndOffsetStub'
import paginateStub from 'tests/fixtures/functions/infra/paginateStub'

import SequelizeModelStub from 'tests/fixtures/functions/infra/SequelizeModelStub'
import EntityMapperStub from 'tests/fixtures/functions/infra/EntityMapperStub'

import SequelizeEntryStub from 'tests/fixtures/functions/infra/SequelizeEntryStub'
import EntityStub from 'tests/fixtures/functions/domain/EntityStub'

// Real Functions
import logmsg from 'tests/fixtures/models/json/logger.json'
import { BaseRepository } from 'src/infra'
import { interfaces } from 'src'

// Mock application configuration
const config = { logmsg }

// Test framework setup
chai.use(chaiEvents)
chai.use(sinonChai)
chai.should()
const expect = chai.expect

describe('BaseRepository', function () {
  let baseRepository

  beforeEach(function () {
    baseRepository = new BaseRepository({
      transactionProvider: TransactionProviderStub,
      redisRepository: RedisRepositoryStub,
      calculateLimitAndOffset: calculateLimitAndOffsetStub,
      paginate: paginateStub,
      config,
      standardError: interfaces.standardError
    })
  })

  describe('init', function () {
    const opts = {
      modelName: 'modelName',
      model: SequelizeModelStub,
      mapper: EntityMapperStub,
      patchAllowedFields: ['field', 'field2'],
      include: [
        {
          model: SequelizeModelStub,
          as: 'realted',
          required: true
        }
      ],
      cacheDisabled: false
    }
    it('should init BaseRepository', async function () {
      baseRepository.init(opts)
      Object.entries(opts).forEach(([key, value]) => {
        expect(baseRepository[key]).to.deep.equal(value)
      })
    })
  })

  describe('setCacheKeys', function () {
    beforeEach(() => {
      sinon.spy(RedisRepositoryStub, 'setCacheKeys')
    })

    afterEach(() => {
      RedisRepositoryStub.setCacheKeys.restore()
    })

    it('should setCacheKeys', async function () {
      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })
      const cacheKeys = ['key1', 'key2']
      baseRepository.setCacheKeys(cacheKeys)

      RedisRepositoryStub.setCacheKeys.should.have.been.calledOnce
      RedisRepositoryStub.setCacheKeys.should.have.been.calledWith('modelName', cacheKeys)
    })
    it('should throw on setCacheKeys if cache is disabled', async function () {
      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub,
        cacheDisabled: true
      })
      let error
      try {
        const cacheKeys = ['key1', 'key2']
        baseRepository.setCacheKeys(cacheKeys)
      } catch (e) {
        error = e
      }
      RedisRepositoryStub.setCacheKeys.should.have.not.been.called
      expect(error.type).to.equal('CacheDisabledError')
    })
  })

  describe('findOneById', function () {
    const obj = {
      id: faker.random.uuid(),
      object: 'modelName'
    }
    beforeEach(() => {
      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })
      sinon.stub(baseRepository, 'findOne').callsFake(() => obj)
    })

    afterEach(() => {
      baseRepository.findOne.restore()
    })

    it('should findOneById (rejectOnEmpty=true)', async function () {
      const res = await baseRepository.findOneById(obj.id)
      baseRepository.findOne.should.have.been.calledOnce
      baseRepository.findOne.should.have.been.calledWith({ id: obj.id })
      expect(res).to.deep.equal(obj)
    })

    it('should findOneById (rejectOnEmpty=false)', async function () {
      const res = await baseRepository.findOneById(obj.id, { rejectOnEmpty: false })
      baseRepository.findOne.should.have.been.calledOnce
      baseRepository.findOne.should.have.been.calledWith({ id: obj.id }, { rejectOnEmpty: false })
      expect(res).to.deep.equal(obj)
    })
  })

  describe('findOne', function () {
    const obj = {
      id: faker.random.uuid(),
      object: 'modelName',
      test: 'test123'
    }
    const where = { test: 'test123' }

    it('should findOne (rejectOnEmpty=true, useCache=true)', async function () {
      sinon.stub(RedisRepositoryStub, 'findOneOrCreate').callsFake(() => obj)
      sinon.spy(baseRepository, '_dbFindOne')
      sinon.spy(EntityMapperStub, 'toEntity')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const res = await baseRepository.findOne(where, true, true)
      expect(RedisRepositoryStub.findOneOrCreate.getCall(0).args[0]).to.equal('modelName')
      expect(RedisRepositoryStub.findOneOrCreate.getCall(0).args[1]).to.deep.equal(where)
      baseRepository._dbFindOne.should.have.not.been.called
      EntityMapperStub.toEntity.should.have.been.calledOnce
      EntityMapperStub.toEntity.should.have.been.calledWith(obj)
      expect(res).to.deep.equal(obj)

      RedisRepositoryStub.findOneOrCreate.restore()
      baseRepository._dbFindOne.restore()
      EntityMapperStub.toEntity.restore()
    })

    it('should findOne (rejectOnEmpty=true, useCache=false)', async function () {
      sinon.spy(RedisRepositoryStub, 'findOneOrCreate')
      sinon.stub(baseRepository, '_dbFindOne').callsFake(() => obj)
      sinon.spy(EntityMapperStub, 'toEntity')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const res = await baseRepository.findOne(where, { rejectOnEmpty: true, useCache: false })
      expect(baseRepository._dbFindOne.getCall(0).args[0]).to.deep.equal(where)
      RedisRepositoryStub.findOneOrCreate.should.have.not.been.called
      EntityMapperStub.toEntity.should.have.been.calledOnce
      EntityMapperStub.toEntity.should.have.been.calledWith(obj)
      expect(res).to.deep.equal(obj)

      RedisRepositoryStub.findOneOrCreate.restore()
      baseRepository._dbFindOne.restore()
      EntityMapperStub.toEntity.restore()
    })

    it('should throw NotFound on findOne (rejectOnEmpty=true, useCache=true)', async function () {
      sinon.stub(RedisRepositoryStub, 'findOneOrCreate').callsFake(() => undefined)
      sinon.spy(baseRepository, '_dbFindOne')
      sinon.spy(baseRepository, '_getNotFoundError')
      sinon.spy(EntityMapperStub, 'toEntity')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      let error
      try {
        await baseRepository.findOne(where)
      } catch (e) {
        error = e
      }
      expect(RedisRepositoryStub.findOneOrCreate.getCall(0).args[0]).to.deep.equal('modelName')
      expect(RedisRepositoryStub.findOneOrCreate.getCall(0).args[1]).to.deep.equal(where)
      baseRepository._dbFindOne.should.have.not.been.called
      EntityMapperStub.toEntity.should.have.not.been.called
      baseRepository._getNotFoundError.should.have.been.calledOnce
      expect(error.message).to.deep.equal('NotFoundError')

      RedisRepositoryStub.findOneOrCreate.restore()
      baseRepository._dbFindOne.restore()
      baseRepository._getNotFoundError.restore()
      EntityMapperStub.toEntity.restore()
    })

    it('should return undefined on findOne (rejectOnEmpty=false, useCache=true)', async function () {
      sinon.stub(RedisRepositoryStub, 'findOneOrCreate').callsFake(() => undefined)
      sinon.spy(baseRepository, '_dbFindOne')
      sinon.spy(baseRepository, '_getNotFoundError')
      sinon.spy(EntityMapperStub, 'toEntity')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const res = await baseRepository.findOne(where, { rejectOnEmpty: false, useCache: true })
      expect(RedisRepositoryStub.findOneOrCreate.getCall(0).args[0]).to.deep.equal('modelName')
      expect(RedisRepositoryStub.findOneOrCreate.getCall(0).args[1]).to.deep.equal(where)
      baseRepository._dbFindOne.should.have.not.been.called
      EntityMapperStub.toEntity.should.have.not.been.called
      baseRepository._getNotFoundError.should.have.not.been.called
      expect(res).to.be.undefined

      RedisRepositoryStub.findOneOrCreate.restore()
      baseRepository._dbFindOne.restore()
      baseRepository._getNotFoundError.restore()
      EntityMapperStub.toEntity.restore()
    })

    it('should throw CacheDisabledError on findOne (useCache=true, cacheDisabled=true)', async function () {
      sinon.spy(RedisRepositoryStub, 'findOneOrCreate')
      sinon.spy(baseRepository, '_dbFindOne')
      sinon.spy(baseRepository, '_getNotFoundError')
      sinon.spy(baseRepository, '_getCacheDisabledError')
      sinon.spy(EntityMapperStub, 'toEntity')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub,
        cacheDisabled: true
      })

      let error
      try {
        await baseRepository.findOne(where, { useCache: true })
      } catch (e) {
        error = e
      }
      RedisRepositoryStub.findOneOrCreate.should.have.not.been.called
      baseRepository._dbFindOne.should.have.not.been.called
      EntityMapperStub.toEntity.should.have.not.been.called
      baseRepository._getNotFoundError.should.have.not.been.called
      baseRepository._getCacheDisabledError.should.have.been.calledOnce
      expect(error.type).to.deep.equal('CacheDisabledError')

      RedisRepositoryStub.findOneOrCreate.restore()
      baseRepository._dbFindOne.restore()
      baseRepository._getNotFoundError.restore()
      baseRepository._getCacheDisabledError.restore()
      EntityMapperStub.toEntity.restore()
    })
  })

  describe('findAll', function () {
    const results = [{
      id: faker.random.uuid(),
      object: 'modelName',
      test: 'test123'
    }, {
      id: faker.random.uuid(),
      object: 'modelName',
      test: 'test123'
    }]
    const where = { test: 'test123' }

    it('should findAll', async function () {
      sinon.stub(SequelizeModelStub, 'findAll').callsFake(() => ([
        SequelizeEntryStub(results[0]),
        SequelizeEntryStub(results[1])
      ]))

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const res = await baseRepository.findAll(where)

      SequelizeModelStub.findAll.should.have.been.calledOnce
      expect(SequelizeModelStub.findAll.getCall(0).args[0].where).to.deep.equal(where)
      expect(res).to.deep.equal(results)

      SequelizeModelStub.findAll.restore()
    })
  })

  describe('findAndCountAll', function () {
    const results = [{
      id: faker.random.uuid(),
      object: 'modelName',
      test: 'test123'
    }, {
      id: faker.random.uuid(),
      object: 'modelName',
      test: 'test123'
    }]
    const where = { test: 'test123' }

    it('should findAndCountAll', async function () {
      sinon.stub(baseRepository, 'calculateLimitAndOffset').callsFake(() => ({
        limit: 10,
        offset: 0
      }))
      sinon.stub(baseRepository, 'paginate').callsFake(() => ({
        currentPage: 1,
        pageCount: 1,
        pageSize: results.length,
        count: results.length
      }))
      const dbRes = {
        rows: results.map(r => SequelizeEntryStub(r)),
        count: results.length
      }
      sinon.stub(SequelizeModelStub, 'findAndCountAll').callsFake(() => dbRes)

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const res = await baseRepository.findAndCountAll(where, 1, 10)

      baseRepository.calculateLimitAndOffset.should.have.been.calledOnce
      baseRepository.calculateLimitAndOffset.should.have.been.calledWith(1, 10)

      SequelizeModelStub.findAndCountAll.should.have.been.calledOnce
      expect(SequelizeModelStub.findAndCountAll.getCall(0).args[0].limit).to.equal(10)
      expect(SequelizeModelStub.findAndCountAll.getCall(0).args[0].offset).to.equal(0)
      expect(SequelizeModelStub.findAndCountAll.getCall(0).args[0].where).to.equal(where)

      baseRepository.paginate.should.have.been.calledOnce
      baseRepository.paginate.should.have.been.calledWith(1, dbRes.count, dbRes.rows, 10)

      expect(res).to.deep.equal({
        data: results,
        meta: {
          currentPage: 1,
          pageCount: 1,
          pageSize: results.length,
          count: results.length
        }
      })

      baseRepository.calculateLimitAndOffset.restore()
      baseRepository.paginate.restore()
      SequelizeModelStub.findAndCountAll.restore()
    })
  })

  describe('post', function () {
    const obj = {
      id: faker.random.uuid(),
      object: 'modelName',
      test: faker.random.word()
    }
    const dbEntry = SequelizeEntryStub(obj)

    it('should post entity', async function () {
      const entity = EntityStub(obj)
      sinon.spy(entity, 'validate')

      sinon.spy(baseRepository, '_getValidationError')
      sinon.stub(SequelizeModelStub, 'create').callsFake(() => dbEntry)
      sinon.stub(EntityMapperStub, 'toDatabase').callsFake(() => obj)
      sinon.stub(EntityMapperStub, 'toEntity').callsFake(() => entity)

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const res = await baseRepository.post(entity)

      entity.validate.should.have.been.calledOnce
      baseRepository._getValidationError.should.have.not.been.called
      EntityMapperStub.toDatabase.should.have.been.calledOnce
      EntityMapperStub.toDatabase.should.have.been.calledWith(entity)
      expect(SequelizeModelStub.create.getCall(0).args[0]).to.deep.equal(obj)
      EntityMapperStub.toEntity.should.have.been.calledOnce
      EntityMapperStub.toEntity.should.have.been.calledWith(obj)

      expect(res).to.deep.equal(entity)

      entity.validate.restore()
      baseRepository._getValidationError.restore()
      SequelizeModelStub.create.restore()
      EntityMapperStub.toDatabase.restore()
      EntityMapperStub.toEntity.restore()
    })

    it('should throw ValidationError on post entity', async function () {
      const entity = EntityStub(obj, false, [{
        message: 'some message',
        path: 'property'
      }])
      sinon.spy(entity, 'validate')

      sinon.spy(baseRepository, '_getValidationError')
      sinon.stub(SequelizeModelStub, 'create').callsFake(() => dbEntry)
      sinon.stub(EntityMapperStub, 'toDatabase').callsFake(() => obj)
      sinon.stub(EntityMapperStub, 'toEntity').callsFake(() => entity)

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      let error
      try {
        await baseRepository.post(entity)
      } catch (e) {
        error = e
      }

      entity.validate.should.have.been.calledOnce
      baseRepository._getValidationError.should.have.been.calledOnce
      EntityMapperStub.toDatabase.should.have.not.been.called
      SequelizeModelStub.create.should.have.not.been.called
      EntityMapperStub.toEntity.should.have.not.been.called
      expect(error.message).to.equal('ValidationError')
      expect(error.errors).to.deep.equal([
        {
          modelName: 'some message',
          location: 'property'
        }
      ])

      entity.validate.restore()
      baseRepository._getValidationError.restore()
      SequelizeModelStub.create.restore()
      EntityMapperStub.toDatabase.restore()
      EntityMapperStub.toEntity.restore()
    })
  })

  describe('patchById', function () {
    const id = faker.random.uuid()
    const updateFields = {
      test: faker.random.word(),
      test2: faker.random.word()
    }
    const obj = {
      id,
      object: 'modelName',
      ...updateFields
    }
    it('should patchById', async function () {
      sinon.stub(baseRepository, 'patch').callsFake(() => obj)

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const res = await baseRepository.patchById(id, updateFields)
      baseRepository.patch.should.have.been.calledOnce
      baseRepository.patch.should.have.been.calledWith({ id }, updateFields)
      expect(res).to.deep.equal(obj)

      baseRepository.patch.restore()
    })
  })

  describe('patch', function () {
    const where = { field: 'value' }
    const updateFields = {
      test: faker.random.word(),
      test2: faker.random.word()
    }
    const obj = {
      id: faker.random.uuid(),
      object: 'modelName',
      field: 'value',
      ...updateFields
    }
    const dbEntry = SequelizeEntryStub(obj)
    const domainEntity = EntityStub(obj)

    it('should patch entity', async function () {
      sinon.stub(baseRepository, '_filterPatchFields').callsFake(() => updateFields)
      sinon.stub(baseRepository, '_getPatchFilter').callsFake(() => where)
      sinon.stub(SequelizeModelStub, 'update').callsFake(() => [1, dbEntry])
      sinon.spy(baseRepository, '_getNotFoundError')
      sinon.stub(EntityMapperStub, 'toEntity').callsFake(() => domainEntity)
      sinon.spy(RedisRepositoryStub, 'delete')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })
      const res = await baseRepository.patch(where, updateFields)

      baseRepository._filterPatchFields.should.have.been.calledOnce
      baseRepository._filterPatchFields.should.have.been.calledWith(updateFields)
      baseRepository._getPatchFilter.should.have.been.calledOnce
      baseRepository._getPatchFilter.should.have.been.calledWith(where)
      expect(SequelizeModelStub.update.getCall(0).args[0]).to.deep.equal(updateFields)
      expect(SequelizeModelStub.update.getCall(0).args[1].where).to.deep.equal(where)
      baseRepository._getNotFoundError.should.have.not.been.called
      EntityMapperStub.toEntity.should.have.been.calledOnce
      EntityMapperStub.toEntity.should.have.been.calledWith(obj)
      RedisRepositoryStub.delete.should.have.been.calledOnce
      expect(RedisRepositoryStub.delete.getCall(0).args[0]).to.deep.equal('modelName')
      expect(RedisRepositoryStub.delete.getCall(0).args[1]).to.deep.equal(obj)
      expect(res).to.deep.equal(domainEntity)

      baseRepository._filterPatchFields.restore()
      baseRepository._getPatchFilter.restore()
      SequelizeModelStub.update.restore()
      baseRepository._getNotFoundError.restore()
      EntityMapperStub.toEntity.restore()
      RedisRepositoryStub.delete.restore()
    })

    it('should patch entity (cacheDisabled=true)', async function () {
      sinon.stub(baseRepository, '_filterPatchFields').callsFake(() => updateFields)
      sinon.stub(baseRepository, '_getPatchFilter').callsFake(() => where)
      sinon.stub(SequelizeModelStub, 'update').callsFake(() => [1, dbEntry])
      sinon.spy(baseRepository, '_getNotFoundError')
      sinon.stub(EntityMapperStub, 'toEntity').callsFake(() => domainEntity)
      sinon.spy(RedisRepositoryStub, 'delete')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub,
        cacheDisabled: true
      })
      const res = await baseRepository.patch(where, updateFields)

      baseRepository._filterPatchFields.should.have.been.calledOnce
      baseRepository._filterPatchFields.should.have.been.calledWith(updateFields)
      baseRepository._getPatchFilter.should.have.been.calledOnce
      baseRepository._getPatchFilter.should.have.been.calledWith(where)
      expect(SequelizeModelStub.update.getCall(0).args[0]).to.deep.equal(updateFields)
      expect(SequelizeModelStub.update.getCall(0).args[1].where).to.deep.equal(where)
      baseRepository._getNotFoundError.should.have.not.been.called
      EntityMapperStub.toEntity.should.have.been.calledOnce
      EntityMapperStub.toEntity.should.have.been.calledWith(obj)
      expect(res).to.deep.equal(domainEntity)

      baseRepository._filterPatchFields.restore()
      baseRepository._getPatchFilter.restore()
      SequelizeModelStub.update.restore()
      baseRepository._getNotFoundError.restore()
      EntityMapperStub.toEntity.restore()
      RedisRepositoryStub.delete.restore()
    })

    it('should throw NotFound on patch entity', async function () {
      sinon.stub(baseRepository, '_filterPatchFields').callsFake(() => updateFields)
      sinon.stub(baseRepository, '_getPatchFilter').callsFake(() => where)
      sinon.stub(SequelizeModelStub, 'update').callsFake(() => [0])
      sinon.spy(baseRepository, '_getNotFoundError')
      sinon.spy(EntityMapperStub, 'toEntity')
      sinon.spy(RedisRepositoryStub, 'delete')
      sinon.spy(RedisRepositoryStub, 'deleteByFilter')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      let error
      try {
        await baseRepository.patch(where, updateFields)
      } catch (e) {
        error = e
      }

      baseRepository._filterPatchFields.should.have.been.calledOnce
      baseRepository._filterPatchFields.should.have.been.calledWith(updateFields)
      baseRepository._getPatchFilter.should.have.been.calledOnce
      baseRepository._getPatchFilter.should.have.been.calledWith(where)
      expect(SequelizeModelStub.update.getCall(0).args[0]).to.deep.equal(updateFields)
      expect(SequelizeModelStub.update.getCall(0).args[1].where).to.deep.equal(where)
      baseRepository._getNotFoundError.should.have.been.calledOnce
      EntityMapperStub.toEntity.should.have.not.been.called
      RedisRepositoryStub.deleteByFilter.should.have.been.calledOnce
      RedisRepositoryStub.deleteByFilter.should.have.been.calledWith('modelName', where)
      expect(error.message).to.equal('NotFoundError')

      baseRepository._filterPatchFields.restore()
      baseRepository._getPatchFilter.restore()
      SequelizeModelStub.update.restore()
      baseRepository._getNotFoundError.restore()
      EntityMapperStub.toEntity.restore()
      RedisRepositoryStub.delete.restore()
      RedisRepositoryStub.deleteByFilter.restore()
    })
  })

  describe('deleteById', function () {
    const id = faker.random.uuid()
    const obj = {
      id,
      object: 'modelName'
    }
    it('should deleteById', async function () {
      sinon.stub(baseRepository, 'delete').callsFake(() => obj)

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const res = await baseRepository.deleteById(id)
      baseRepository.delete.should.have.been.calledOnce
      baseRepository.delete.should.have.been.calledWith({ id })
      expect(res).to.deep.equal(obj)

      baseRepository.delete.restore()
    })
  })

  describe('delete', function () {
    const where = { field: 'value' }
    const obj = {
      id: faker.random.uuid(),
      object: 'modelName',
      field: 'value'
    }
    const dbEntry = SequelizeEntryStub(obj)
    const domainEntity = EntityStub(obj)

    it('should delete entity', async function () {
      sinon.stub(baseRepository, '_getPatchFilter').callsFake(() => where)
      sinon.stub(SequelizeModelStub, 'destroy').callsFake(() => [1, dbEntry])
      sinon.spy(baseRepository, '_getNotFoundError')
      sinon.stub(EntityMapperStub, 'toEntity').callsFake(() => domainEntity)
      sinon.spy(RedisRepositoryStub, 'delete')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const res = await baseRepository.delete(where)

      baseRepository._getPatchFilter.should.have.been.calledOnce
      baseRepository._getPatchFilter.should.have.been.calledWith(where)
      SequelizeModelStub.destroy.should.have.been.calledOnce
      expect(SequelizeModelStub.destroy.getCall(0).args[0].where).to.deep.equal(where)
      baseRepository._getNotFoundError.should.have.not.been.called
      EntityMapperStub.toEntity.should.have.been.calledOnce
      EntityMapperStub.toEntity.should.have.been.calledWith(obj)
      RedisRepositoryStub.delete.should.have.been.calledOnce
      RedisRepositoryStub.delete.should.have.been.calledWith('modelName', obj)
      expect(res).to.deep.equal(domainEntity)

      baseRepository._getPatchFilter.restore()
      SequelizeModelStub.destroy.restore()
      baseRepository._getNotFoundError.restore()
      EntityMapperStub.toEntity.restore()
      RedisRepositoryStub.delete.restore()
    })

    it('should delete entity (cacheDisabled=true)', async function () {
      sinon.stub(baseRepository, '_getPatchFilter').callsFake(() => where)
      sinon.stub(SequelizeModelStub, 'destroy').callsFake(() => [1, dbEntry])
      sinon.spy(baseRepository, '_getNotFoundError')
      sinon.stub(EntityMapperStub, 'toEntity').callsFake(() => domainEntity)
      sinon.spy(RedisRepositoryStub, 'delete')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub,
        cacheDisabled: true
      })

      const res = await baseRepository.delete(where)

      baseRepository._getPatchFilter.should.have.been.calledOnce
      baseRepository._getPatchFilter.should.have.been.calledWith(where)
      SequelizeModelStub.destroy.should.have.been.calledOnce
      expect(SequelizeModelStub.destroy.getCall(0).args[0].where).to.deep.equal(where)
      baseRepository._getNotFoundError.should.have.not.been.called
      EntityMapperStub.toEntity.should.have.been.calledOnce
      EntityMapperStub.toEntity.should.have.been.calledWith(obj)
      expect(res).to.deep.equal(domainEntity)

      baseRepository._getPatchFilter.restore()
      SequelizeModelStub.destroy.restore()
      baseRepository._getNotFoundError.restore()
      EntityMapperStub.toEntity.restore()
      RedisRepositoryStub.delete.restore()
    })

    it('should throw NotFound on patch entity', async function () {
      sinon.stub(baseRepository, '_getPatchFilter').callsFake(() => where)
      sinon.stub(SequelizeModelStub, 'destroy').callsFake(() => [0])
      sinon.spy(baseRepository, '_getNotFoundError')
      sinon.spy(EntityMapperStub, 'toEntity')
      sinon.spy(RedisRepositoryStub, 'delete')
      sinon.spy(RedisRepositoryStub, 'deleteByFilter')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      let error
      try {
        await baseRepository.delete(where)
      } catch (e) {
        error = e
      }

      baseRepository._getPatchFilter.should.have.been.calledOnce
      baseRepository._getPatchFilter.should.have.been.calledWith(where)
      SequelizeModelStub.destroy.should.have.been.calledOnce
      expect(SequelizeModelStub.destroy.getCall(0).args[0].where).to.deep.equal(where)
      baseRepository._getNotFoundError.should.have.been.calledOnce
      EntityMapperStub.toEntity.should.have.not.been.called
      RedisRepositoryStub.deleteByFilter.should.have.been.calledOnce
      RedisRepositoryStub.deleteByFilter.should.have.been.calledWith('modelName', where)
      expect(error.message).to.deep.equal('NotFoundError')

      baseRepository._getPatchFilter.restore()
      SequelizeModelStub.destroy.restore()
      baseRepository._getNotFoundError.restore()
      EntityMapperStub.toEntity.restore()
      RedisRepositoryStub.delete.restore()
      RedisRepositoryStub.deleteByFilter.restore()
    })
  })

  describe('_dbFindOne', function () {
    const where = { test: 'test123' }
    const obj = {
      id: faker.random.uuid(),
      object: 'modelName',
      test: 'test123'
    }
    const dbEntry = SequelizeEntryStub(obj)

    afterEach(() => {
      SequelizeModelStub.findOne.restore()
    })

    it('should find entity in db', async function () {
      sinon.stub(SequelizeModelStub, 'findOne').callsFake(() => dbEntry)

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const res = await baseRepository._dbFindOne(where)

      SequelizeModelStub.findOne.should.have.been.calledOnce
      expect(SequelizeModelStub.findOne.getCall(0).args[0].where).to.deep.equal(where)
      expect(res).to.deep.equal(obj)
    })

    it('should return undefined', async function () {
      sinon.stub(SequelizeModelStub, 'findOne').callsFake(() => undefined)

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const res = await baseRepository._dbFindOne(where)

      SequelizeModelStub.findOne.should.have.been.calledOnce
      expect(SequelizeModelStub.findOne.getCall(0).args[0].where).to.deep.equal(where)
      expect(res).to.be.undefined
    })
  })

  describe('_getPatchFilter', function () {
    const obj = {
      id: faker.random.uuid()
    }

    afterEach(() => {
      RedisRepositoryStub.findOne.restore()
      baseRepository._dbFindOne.restore()
      baseRepository._getNotFoundError.restore()
    })

    it('should get patch filter (no related entities filter)', async function () {
      sinon.spy(RedisRepositoryStub, 'findOne')
      sinon.spy(baseRepository, '_dbFindOne')
      sinon.spy(baseRepository, '_getNotFoundError')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })
      const filter = {
        field: faker.random.word(),
        field1: faker.random.word()
      }
      const res = await baseRepository._getPatchFilter(filter)
      RedisRepositoryStub.findOne.should.have.not.been.called
      baseRepository._dbFindOne.should.have.not.been.called
      baseRepository._getNotFoundError.should.have.not.been.called
      expect(res).to.deep.equal(filter)
    })

    it('should get patch filter (related entities filter, get from cache)', async function () {
      sinon.stub(RedisRepositoryStub, 'findOne').callsFake(() => obj)
      sinon.spy(baseRepository, '_dbFindOne')
      sinon.spy(baseRepository, '_getNotFoundError')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })
      const filter = {
        field: faker.random.word(),
        '$related.field$': faker.random.word()
      }
      const res = await baseRepository._getPatchFilter(filter)
      RedisRepositoryStub.findOne.should.have.been.calledOnce
      RedisRepositoryStub.findOne.should.have.been.calledWith('modelName', filter)
      baseRepository._dbFindOne.should.have.not.been.called
      baseRepository._getNotFoundError.should.have.not.been.called
      expect(res).to.deep.equal({ id: obj.id })
    })

    it('should get patch filter (related entities filter, get from db)', async function () {
      sinon.stub(RedisRepositoryStub, 'findOne').callsFake(() => undefined)
      sinon.stub(baseRepository, '_dbFindOne').callsFake(() => obj)
      sinon.spy(baseRepository, '_getNotFoundError')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })
      const filter = {
        field: faker.random.word(),
        '$related.field$': faker.random.word()
      }
      const res = await baseRepository._getPatchFilter(filter)
      RedisRepositoryStub.findOne.should.have.been.calledOnce
      RedisRepositoryStub.findOne.should.have.been.calledWith('modelName', filter)
      baseRepository._dbFindOne.should.have.been.calledOnce
      baseRepository._dbFindOne.should.have.been.calledWith(filter)
      baseRepository._getNotFoundError.should.have.not.been.called
      expect(res).to.deep.equal({ id: obj.id })
    })

    it('should throw NotFound (related entities filter)', async function () {
      sinon.stub(RedisRepositoryStub, 'findOne').callsFake(() => undefined)
      sinon.stub(baseRepository, '_dbFindOne').callsFake(() => undefined)
      sinon.spy(baseRepository, '_getNotFoundError')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })
      const filter = {
        field: faker.random.word(),
        '$related.field$': faker.random.word()
      }

      let error
      try {
        await baseRepository._getPatchFilter(filter)
      } catch (e) {
        error = e
      }

      RedisRepositoryStub.findOne.should.have.been.calledOnce
      RedisRepositoryStub.findOne.should.have.been.calledWith('modelName', filter)
      baseRepository._dbFindOne.should.have.been.calledOnce
      baseRepository._dbFindOne.should.have.been.calledWith(filter)
      baseRepository._getNotFoundError.should.have.been.calledOnce
      expect(error.message).to.equal('NotFoundError')
    })
  })

  describe('_getTransaction', function () {
    it('should get transaction', async function () {
      sinon.spy(TransactionProviderStub, 'getSequelizeTransaction')

      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      const transaction = baseRepository._getTransaction()
      TransactionProviderStub.getSequelizeTransaction.should.have.been.calledOnce
      expect(transaction).to.exist

      TransactionProviderStub.getSequelizeTransaction.restore()
    })
  })

  describe('_filterPatchFields', function () {
    const updateFields = {
      test: faker.random.word(),
      test1: faker.random.word(),
      test3: faker.random.word()
    }
    it('should filter patch fields', async function () {
      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub,
        patchAllowedFields: ['test', 'test1']
      })
      const filteredFields = baseRepository._filterPatchFields(updateFields)
      expect(filteredFields).to.deep.equal({
        test: updateFields.test,
        test1: updateFields.test1
      })
    })

    it('should throw error if patchAllowedFields was not provided', async function () {
      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })

      let error
      try {
        baseRepository._filterPatchFields(updateFields)
      } catch (e) {
        error = e
      }

      expect(error.type).to.equal('InvalidPatchAllowedFields')
    })
  })

  describe('_getCapitalizedModelName', function () {
    it('should get capitalized model name', async function () {
      baseRepository.init({
        modelName: 'modelName',
        model: SequelizeModelStub,
        mapper: EntityMapperStub
      })
      const capitalized = baseRepository._getCapitalizedModelName()
      expect(capitalized).to.equal('ModelName')
    })
  })
})
