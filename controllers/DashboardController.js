import Flight from '../models/Flight.js'
import Reservation from '../models/Reservation.js'

const getAggregateTotal = (aggregateResult) => aggregateResult?.[0]?.total || 0

const calculateGrowth = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Math.round(((current - previous) / previous) * 100)
}

export const getDashboardOverview = async (_req, res) => {
  try {
    const now = new Date()
    const currentPeriodStart = new Date(now)
    currentPeriodStart.setDate(currentPeriodStart.getDate() - 30)

    const previousPeriodStart = new Date(currentPeriodStart)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - 30)

    const [
      totalFlights,
      totalReservations,
      pendingBookings,
      totalRevenueAgg,
      distinctCustomers,
      currentRevenueAgg,
      previousRevenueAgg,
      recentReservations,
      topFlightsAgg,
      reservationCategoryRevenue,
      flightCategoryCounts,
      currentFlightsPeriodCount,
      previousFlightsPeriodCount,
      currentReservationsPeriodCount,
      previousReservationsPeriodCount,
      currentCustomersPeriod,
      previousCustomersPeriod
    ] = await Promise.all([
      Flight.countDocuments(),
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: 'pending' }),
      Reservation.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Reservation.distinct('email'),
      Reservation.aggregate([
        { $match: { createdAt: { $gte: currentPeriodStart }, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Reservation.aggregate([
        { $match: { createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart }, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Reservation.find()
        .populate('flight', 'title category price mainImage rating')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Reservation.aggregate([
        {
          $group: {
            _id: '$flight',
            reservationCount: { $sum: 1 },
            totalRevenue: { $sum: '$total' }
          }
        },
        { $sort: { reservationCount: -1, totalRevenue: -1 } },
        { $limit: 5 }
      ]),
      Reservation.aggregate([
        {
          $lookup: {
            from: 'flights',
            localField: 'flight',
            foreignField: '_id',
            as: 'flight'
          }
        },
        { $unwind: '$flight' },
        {
          $group: {
            _id: '$flight.category',
            revenue: { $sum: '$total' }
          }
        }
      ]),
      Flight.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Flight.countDocuments({ createdAt: { $gte: currentPeriodStart } }),
      Flight.countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart } }),
      Reservation.countDocuments({ createdAt: { $gte: currentPeriodStart } }),
      Reservation.countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart } }),
      Reservation.distinct('email', { createdAt: { $gte: currentPeriodStart } }),
      Reservation.distinct('email', { createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart } })
    ])

    const flightIds = topFlightsAgg
      .map(item => item._id)
      .filter(Boolean)

    let topFlights = []
    if (flightIds.length) {
      const flights = await Flight.find({ _id: { $in: flightIds } })
        .select('title overview category price rating mainImage')
        .lean()

      const flightMap = new Map(flights.map(flight => [flight._id.toString(), flight]))

      topFlights = topFlightsAgg
        .map(item => {
          const flight = flightMap.get(item._id?.toString())
          if (!flight) return null
          return {
            _id: flight._id,
            title: flight.title,
            overview: flight.overview,
            category: flight.category,
            rating: flight.rating,
            price: flight.price,
            mainImage: flight.mainImage,
            reservationCount: item.reservationCount,
            totalRevenue: item.totalRevenue
          }
        })
        .filter(Boolean)
    }

    const categoryStats = {}
    flightCategoryCounts.forEach(category => {
      const key = category._id || 'uncategorized'
      categoryStats[key] = {
        count: category.count,
        revenue: 0
      }
    })

    reservationCategoryRevenue.forEach(category => {
      const key = category._id || 'uncategorized'
      if (!categoryStats[key]) {
        categoryStats[key] = { count: 0, revenue: 0 }
      }
      categoryStats[key].revenue = category.revenue
    })

    const totalRevenue = getAggregateTotal(totalRevenueAgg)
    const currentRevenue = getAggregateTotal(currentRevenueAgg)
    const previousRevenue = getAggregateTotal(previousRevenueAgg)

    const stats = {
      totalRevenue,
      totalRevenue,
      totalFlights,
      totalReservations,
      pendingBookings,
      totalCustomers: distinctCustomers.length,
      revenueGrowth: calculateGrowth(currentRevenue, previousRevenue),
      flightsGrowth: calculateGrowth(currentFlightsPeriodCount, previousFlightsPeriodCount),
      reservationsGrowth: calculateGrowth(currentReservationsPeriodCount, previousReservationsPeriodCount),
      customersGrowth: calculateGrowth(currentCustomersPeriod.length, previousCustomersPeriod.length)
    }

    res.json({
      stats,
      recentReservations,
      topFlights,
      categoryStats
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load dashboard data',
      error: error.message
    })
  }
}

